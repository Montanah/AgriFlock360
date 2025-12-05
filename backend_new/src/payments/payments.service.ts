// payments/payments.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../database/entities/Payment.entity';
import { Device } from '../database/entities/Device.entity';
import { User } from '../database/entities/User.entity';
import {
  InitiatePaymentDto,
  PaystackCallbackDto,
  QueryPaymentsDto,
} from './dto/payments.dto';
import { PaystackService } from './paystack.service';
import { PaygService } from './payg.service';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService, AuditAction } from '../services/audit.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    private paystackService: PaystackService,
    private paygService: PaygService,
    private logger: CustomLogger,
    private auditService: AuditService,
  ) {}

  async initiate(
    initiatePaymentDto: InitiatePaymentDto,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate device if provided
    if (initiatePaymentDto.device_id) {
      const device = await this.deviceRepository.findOne({
        where: { id: initiatePaymentDto.device_id },
      });

      if (!device) {
        throw new NotFoundException('Device not found');
      }

      if (device.owner_id !== userId) {
        throw new ForbiddenException('Not authorized for this device');
      }
    }

    // Create payment record
    const payment = this.paymentRepository.create({
      user_id: userId,
      device_id: initiatePaymentDto.device_id,
      amount: initiatePaymentDto.amount,
      currency: initiatePaymentDto.currency,
      payment_method: initiatePaymentDto.payment_method,
      payment_purpose: initiatePaymentDto.purpose,
      phone_number: initiatePaymentDto.phone_number,
      status: 'pending',
      transaction_ref: crypto.randomUUID(),
    });

    await this.paymentRepository.save(payment);

    // Initialize Paystack transaction
    const paystackResponse = await this.paystackService.initializeTransaction(
      user.email,
      initiatePaymentDto.amount,
      {
        payment_id: payment.id,
        user_id: userId,
        device_id: initiatePaymentDto.device_id,
        purpose: initiatePaymentDto.purpose,
        phone_number: initiatePaymentDto.phone_number,
      },
      initiatePaymentDto.payment_method === 'mpesa'
        ? ['mobile_money']
        : ['card', 'bank'],
    );

    // Update payment with Paystack reference
    payment.transaction_ref = paystackResponse.reference;
    payment.meta = paystackResponse;
    await this.paymentRepository.save(payment);

    await this.auditService.log(
      userId,
      AuditAction.PAYMENT_INITIATED,
      'payment',
      payment.id,
      ipAddress,
      userAgent,
      {
        amount: payment.amount,
        method: payment.payment_method,
        purpose: payment.payment_purpose,
      },
    );

    this.logger.log(`Payment initiated: ${payment.id} by user ${userId}`);

    return {
      payment_id: payment.id,
      checkout_url: paystackResponse.authorization_url,
      reference: paystackResponse.reference,
    };
  }

  async handleCallback(
    callbackDto: PaystackCallbackDto,
    signature: string,
    rawBody: string,
  ) {
    // Verify webhook signature
    const isValid = this.paystackService.verifyWebhookSignature(
      rawBody,
      signature,
    );

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const { event, data } = callbackDto;

    if (event !== 'charge.success') {
      this.logger.warn(`Unhandled Paystack event: ${event}`);
      return { success: true };
    }

    // Find payment by reference
    const payment = await this.paymentRepository.findOne({
      where: { transaction_ref: data.reference },
      relations: ['user', 'device'],
    });

    if (!payment) {
      this.logger.error(`Payment not found for reference: ${data.reference}`);
      throw new NotFoundException('Payment not found');
    }

    // Update payment status
    payment.status = data.status === 'success' ? 'completed' : 'failed';
    payment.processed_at = new Date();
    payment.meta = { ...payment.meta, callback_data: data };

    await this.paymentRepository.save(payment);

    // Process payment based on purpose
    if (payment.status === 'completed') {
      await this.processSuccessfulPayment(payment);
    }

    this.logger.log(
      `Payment ${payment.status}: ${payment.id} - ${data.reference}`,
    );

    return { success: true };
  }

  async findAll(userId: string, query: QueryPaymentsDto) {
    const { status, device_id, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.device', 'device')
      .where('payment.user_id = :userId', { userId })
      .skip(skip)
      .take(limit)
      .orderBy('payment.created_at', 'DESC');

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    if (device_id) {
      queryBuilder.andWhere('payment.device_id = :device_id', { device_id });
    }

    const [payments, total] = await queryBuilder.getManyAndCount();

    return {
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(paymentId: string, userId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['device', 'user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.user_id !== userId) {
      throw new ForbiddenException('Not authorized to access this payment');
    }

    return { payment };
  }

  private async processSuccessfulPayment(payment: Payment) {
    switch (payment.payment_purpose) {
      case 'payg_topup':
        if (payment.device_id) {
          await this.paygService.creditBalance(
            payment.device_id,
            payment.amount,
            payment.id,
            `PAYG topup via ${payment.payment_method}`,
          );
        }
        break;

      case 'device_purchase':
        // Handle device purchase logic
        this.logger.log(`Device purchase payment processed: ${payment.id}`);
        break;

      case 'subscription':
        // Handle subscription logic
        this.logger.log(`Subscription payment processed: ${payment.id}`);
        break;

      default:
        this.logger.log(`Payment processed: ${payment.id}`);
    }
  }
}
