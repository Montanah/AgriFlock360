// payments/subscription-payment.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../database/entities/Subscription.entity';
import { Payment } from '../database/entities/Payment.entity';
import { SubscriptionInvoice } from '../database/entities/SubscriptionInvoice.entity';

@Injectable()
export class SubscriptionPaymentService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(SubscriptionInvoice)
    private readonly invoiceRepo: Repository<SubscriptionInvoice>,
  ) {}

  async processTopupPayment(
    subscriptionId: string,
    paymentId: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    if (payment.status !== 'completed') {
      throw new BadRequestException('Payment not completed');
    }

    // Add balance
    subscription.balance =
      Number(subscription.balance) + Number(payment.amount);
    subscription.total_spent =
      Number(subscription.total_spent) + Number(payment.amount);

    return await this.subscriptionRepo.save(subscription);
  }

  async createInvoice(
    subscriptionId: string,
    periodStart: Date,
    periodEnd: Date,
  ): Promise<SubscriptionInvoice> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id: subscriptionId },
      relations: ['plan', 'usage_records'],
    });

    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    const invoiceNumber = this.generateInvoiceNumber();
    const invoiceDate = new Date();
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 7); // 7 days to pay

    // Calculate totals from current charges
    const subtotal = Number(subscription.current_charges);
    const discount = this.calculateDiscount(subscription, subtotal);
    const tax = this.calculateTax(subtotal - discount);
    const total = subtotal - discount + tax;

    // Build usage summary
    const usageSummary = {
      base_fee: Number(subscription.plan.base_fee),
      total_readings: subscription.current_readings_count,
      readings_cost: 0,
      total_alerts: subscription.current_alerts_count,
      alerts_cost: 0,
      total_data_kb: Number(subscription.current_data_usage_kb),
      data_cost: 0,
      device_days: 0,
      device_cost: 0,
    };

    const invoice = this.invoiceRepo.create({
      invoice_number: invoiceNumber,
      subscription_id: subscriptionId,
      invoice_date: invoiceDate,
      due_date: dueDate,
      period_start: periodStart,
      period_end: periodEnd,
      status: 'pending',
      subtotal,
      discount,
      tax,
      total,
      balance: total,
      usage_summary: usageSummary,
    });

    return await this.invoiceRepo.save(invoice);
  }

  private generateInvoiceNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `INV-${timestamp}-${random}`;
  }

  private calculateDiscount(
    subscription: Subscription,
    subtotal: number,
  ): number {
    if (subscription.discount_percentage > 0) {
      return (subtotal * Number(subscription.discount_percentage)) / 100;
    }
    return Number(subscription.discount_amount);
  }

  private calculateTax(amount: number): number {
    const TAX_RATE = 0.16; // 16% VAT
    return amount * TAX_RATE;
  }

  async markInvoicePaid(
    invoiceId: string,
    paymentId: string,
  ): Promise<SubscriptionInvoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    invoice.status = 'paid';
    invoice.payment_id = paymentId;
    invoice.paid_at = new Date();
    invoice.amount_paid = Number(invoice.total);
    invoice.balance = 0;

    return await this.invoiceRepo.save(invoice);
  }
}
