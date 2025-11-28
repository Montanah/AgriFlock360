
// payments/services/payg.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../database/entities/Device.entity';
import { PaygTransaction } from '../database/entities/PaygTransaction.entity';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService, AuditAction } from '../services/audit.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from 'src/notifications/notifications.service';
import { RedisCacheService } from 'src/common/redis/redis-cache.service';

@Injectable()
export class PaygService {
  private readonly DAILY_RATE = 20; // KES per day

  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(PaygTransaction)
    private paygTransactionRepository: Repository<PaygTransaction>,
    private logger: CustomLogger,
    private auditService: AuditService,
    private notificationsService: NotificationsService,
    private redisCache: RedisCacheService,
  ) {}

  async creditBalance(
    deviceId: string,
    amount: number,
    paymentId: string,
    description: string,
  ) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const balanceBefore = Number(device.payg_balance);
    const balanceAfter = balanceBefore + amount;

    // Create transaction record
    const transaction = this.paygTransactionRepository.create({
      device_id: deviceId,
      payment_id: paymentId,
      transaction_type: 'credit',
      amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description,
    });

    await this.paygTransactionRepository.save(transaction);

    // Update device balance
    device.payg_balance = balanceAfter;

    // Unlock if locked and has sufficient balance
    if (device.is_payg_locked && balanceAfter >= this.DAILY_RATE) {
      device.is_payg_locked = false;

      // Create unlock transaction
      await this.paygTransactionRepository.save({
        device_id: deviceId,
        transaction_type: 'unlock',
        amount: 0,
        balance_before: balanceAfter,
        balance_after: balanceAfter,
        description: 'Auto-unlocked after top-up',
      });
    }

    await this.deviceRepository.save(device);

    this.logger.log(
      `PAYG credited: Device ${device.device_id} +${amount} = ${balanceAfter}`,
    );

    await this.redisCache.invalidatePaygBalance(deviceId);

    return {
      device_id: deviceId,
      previous_balance: balanceBefore,
      new_balance: balanceAfter,
      is_locked: device.is_payg_locked,
    };
  }

  async debitBalance(deviceId: string, amount: number, description: string) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const balanceBefore = Number(device.payg_balance);
    const balanceAfter = Math.max(0, balanceBefore - amount);

    // Create transaction record
    const transaction = this.paygTransactionRepository.create({
      device_id: deviceId,
      transaction_type: 'debit',
      amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      description,
    });

    await this.paygTransactionRepository.save(transaction);

    // Update device balance
    device.payg_balance = balanceAfter;

    // Lock if balance insufficient
    if (balanceAfter < this.DAILY_RATE && !device.is_payg_locked) {
      device.is_payg_locked = true;

      // Create lock transaction
      await this.paygTransactionRepository.save({
        device_id: deviceId,
        transaction_type: 'lock',
        amount: 0,
        balance_before: balanceAfter,
        balance_after: balanceAfter,
        description: 'Auto-locked due to insufficient balance',
      });
    }

    await this.deviceRepository.save(device);
     
    this.logger.log(
      `PAYG debited: Device ${device.device_id} -${amount} = ${balanceAfter}`,
    );
    
     // Check if balance is low and send notification
    if (balanceAfter < this.DAILY_RATE * 3 && balanceAfter > 0) {
      if (device.owner_id) {
        await this.notificationsService.createPaygLowBalanceNotification(
          device.owner_id,
          deviceId,
          balanceAfter,
          Math.floor(balanceAfter / this.DAILY_RATE),
        );
      }
    }
    
    return {
      device_id: deviceId,
      previous_balance: balanceBefore,
      new_balance: balanceAfter,
      is_locked: device.is_payg_locked,
    };
  }

  async getBalance(deviceId: string, userId: string) {
    // Try Redis cache first
  let balance = await this.redisCache.getPaygBalance(deviceId);
  
  if (balance) {
    return {
      balance: balance.balance,
      daily_rate: balance.daily_rate,
      days_remaining: Math.floor(balance.balance / balance.daily_rate),
      is_locked: balance.is_locked,
      cached: true,
    };
  }
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.owner_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    //const balance = Number(device.payg_balance);
    //const daysRemaining = Math.floor(balance / this.DAILY_RATE);
    const balanceData = {
      balance: Number(device.payg_balance),
      daily_rate: this.DAILY_RATE,
      last_deduction: new Date(),
      is_locked: device.is_payg_locked,
    };

    // Cache it
    await this.redisCache.cachePaygBalance(deviceId, balanceData);


    return {
      //balance,
      balance: balanceData.balance,
      daily_rate: this.DAILY_RATE,
      days_remaining: Math.floor(balanceData.balance / this.DAILY_RATE),
      is_locked: device.is_payg_locked,
      last_updated: device.updated_at,
      cached: false,
    };
  }

  async getTransactions(deviceId: string, userId: string, page = 1, limit = 20) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.owner_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await this.paygTransactionRepository.findAndCount({
      where: { device_id: deviceId },
      order: { created_at: 'DESC' },
      skip,
      take: limit,
      relations: ['payment'],
    });

    return {
      transactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async unlock(
    deviceId: string,
    reason: string,
    userId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.is_payg_locked) {
      device.is_payg_locked = false;
      await this.deviceRepository.save(device);

      // Create unlock transaction
      await this.paygTransactionRepository.save({
        device_id: deviceId,
        transaction_type: 'unlock',
        amount: 0,
        balance_before: Number(device.payg_balance),
        balance_after: Number(device.payg_balance),
        description: `Manual unlock: ${reason}`,
      });

      await this.auditService.log(
        userId,
        AuditAction.PAYG_UNLOCKED,
        'device',
        deviceId,
        ipAddress,
        userAgent,
        { reason },
      );

      this.logger.log(`Device unlocked: ${device.device_id} - ${reason}`);
    }

    return { success: true, is_locked: false };
  }

  // Cron job to debit daily rate
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async dailyDebit() {
    this.logger.log('Running daily PAYG debit job');

    const activeDevices = await this.deviceRepository.find({
      where: { is_payg_locked: false },
    });

    for (const device of activeDevices) {
      try {
        await this.debitBalance(
          device.id,
          this.DAILY_RATE,
          'Daily PAYG rate deduction',
        );
      } catch (error) {
        this.logger.error(
          `Failed to debit device ${device.device_id}: ${error.message}`,
        );
      }
    }

    this.logger.log(`Daily PAYG debit completed for ${activeDevices.length} devices`);
  }
}
