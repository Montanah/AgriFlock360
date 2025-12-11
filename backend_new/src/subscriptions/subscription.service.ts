// services/subscription.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, DeepPartial } from 'typeorm';
import { Subscription } from '../database/entities/Subscription.entity';
import { SubscriptionPlan } from '../database/entities/SubscriptionPlan.entity';
import { UsageRecord } from '../database/entities/UsageRecord.entity';
import { SubscriptionInvoice } from '../database/entities/SubscriptionInvoice.entity';
import {
  CreateSubscriptionDto,
  TopupBalanceDto,
  RecordUsageDto,
  QuerySubscriptionDto,
  UsageReportDto,
} from './dto/subscriptions.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(UsageRecord)
    private readonly usageRepo: Repository<UsageRecord>,
    @InjectRepository(SubscriptionInvoice)
    private readonly invoiceRepo: Repository<SubscriptionInvoice>,
  ) {}

  async create(dto: CreateSubscriptionDto): Promise<Subscription> {
    // Check for existing active subscription
    const existing = await this.subscriptionRepo.findOne({
      where: {
        user_id: dto.user_id,
        status: 'active',
      },
    });

    if (existing) {
      throw new ConflictException('User already has an active subscription');
    }

    // Get plan details
    const plan = await this.planRepo.findOne({
      where: { id: dto.plan_id },
    });

    if (!plan || !plan.is_active) {
      throw new NotFoundException('Subscription plan not found or inactive');
    }

    const startDate = new Date(dto.start_date);
    const trialDays = dto.trial_days || plan.metadata?.trial_days || 0;

    let endDate: Date | null = null;
    let trialEndDate: Date | null = null;
    let nextBillingDate: Date | null = null;

    if (trialDays > 0) {
      trialEndDate = new Date(startDate);
      trialEndDate.setDate(trialEndDate.getDate() + trialDays);
      nextBillingDate = trialEndDate;
    }

    // Calculate end date for fixed plans
    if (plan.plan_type !== 'payg') {
      endDate = new Date(startDate);
      if (plan.plan_type === 'monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.plan_type === 'quarterly') {
        endDate.setMonth(endDate.getMonth() + 3);
      } else if (plan.plan_type === 'annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      if (!nextBillingDate) {
        nextBillingDate = endDate;
      }
    }

    const subscription = this.subscriptionRepo.create({
      user_id: dto.user_id,
      plan_id: dto.plan_id,
      start_date: startDate,
      end_date: endDate,
      trial_end_date: trialEndDate,
      next_billing_date: nextBillingDate,
      current_period_start: startDate,
      current_period_end: endDate,
      auto_renew: dto.auto_renew || false,
      balance: dto.initial_balance || 0,
      low_balance_threshold: dto.low_balance_threshold || 100,
      auto_topup_enabled: dto.auto_topup_enabled || false,
      auto_topup_amount: dto.auto_topup_amount,
      auto_topup_trigger: dto.auto_topup_trigger,
      custom_max_devices: dto.custom_max_devices,
      discount_code: dto.discount_code,
      status: trialDays > 0 ? 'trial' : 'active',
    } as DeepPartial<Subscription>);

    return await this.subscriptionRepo.save(subscription);
  }

  async findAll(query: QuerySubscriptionDto) {
    const {
      user_id,
      plan_id,
      status,
      auto_renew,
      page = 1,
      limit = 10,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.subscriptionRepo
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.user', 'user')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .leftJoinAndSelect('subscription.devices', 'devices');

    if (user_id) {
      queryBuilder.andWhere('subscription.user_id = :user_id', { user_id });
    }

    if (plan_id) {
      queryBuilder.andWhere('subscription.plan_id = :plan_id', { plan_id });
    }

    if (status) {
      queryBuilder.andWhere('subscription.status = :status', { status });
    }

    if (auto_renew !== undefined) {
      queryBuilder.andWhere('subscription.auto_renew = :auto_renew', {
        auto_renew,
      });
    }

    queryBuilder
      .orderBy('subscription.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return { data, total, page, limit };
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id },
      relations: ['user', 'plan', 'devices', 'invoices'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async findByUser(userId: string): Promise<Subscription[]> {
    return await this.subscriptionRepo.find({
      where: { user_id: userId },
      relations: ['plan', 'devices'],
      order: { created_at: 'DESC' },
    });
  }

  async topupBalance(dto: TopupBalanceDto): Promise<Subscription> {
    const subscription = await this.findOne(dto.subscription_id);

    // Here you would integrate with your payment service
    // For now, we'll just add the balance
    subscription.balance = Number(subscription.balance) + dto.amount;
    subscription.total_spent = Number(subscription.total_spent) + dto.amount;

    return await this.subscriptionRepo.save(subscription);
  }

  async recordUsage(dto: RecordUsageDto): Promise<UsageRecord> {
    const subscription = await this.findOne(dto.subscription_id);
    const plan = await this.planRepo.findOne({
      where: { id: subscription.plan_id },
    });

    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Check if subscription is active
    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      throw new BadRequestException('Subscription is not active');
    }

    // Determine unit price and if it's free
    let unitPrice = 0;
    let isFree = false;
    const quantity = dto.quantity || 1;

    switch (dto.usage_type) {
      case 'reading':
        if (
          subscription.current_readings_count < plan.free_readings_per_month
        ) {
          isFree = true;
        } else {
          unitPrice = Number(plan.per_reading_fee);
        }
        subscription.current_readings_count += quantity;
        subscription.total_readings += quantity;
        break;

      case 'alert':
        if (subscription.current_alerts_count < plan.free_alerts_per_month) {
          isFree = true;
        } else {
          unitPrice = Number(plan.per_alert_fee);
        }
        subscription.current_alerts_count += quantity;
        subscription.total_alerts += quantity;
        break;

      case 'data_transfer':
        unitPrice = Number(plan.per_kb_fee);
        subscription.current_data_usage_kb += dto.data_size_kb || 0;
        break;

      case 'device_day':
        unitPrice = Number(plan.per_device_fee);
        break;

      case 'base_fee':
        unitPrice = Number(plan.base_fee);
        break;
    }

    const totalCost = isFree ? 0 : unitPrice * quantity;

    // Check balance for PAYG
    if (plan.plan_type === 'payg' && !isFree) {
      if (Number(subscription.balance) < totalCost) {
        throw new BadRequestException('Insufficient balance');
      }
      subscription.balance = Number(subscription.balance) - totalCost;
    }

    subscription.current_charges =
      Number(subscription.current_charges) + totalCost;

    // Create usage record
    const usageRecord = this.usageRepo.create({
      subscription_id: dto.subscription_id,
      device_id: dto.device_id,
      usage_type: dto.usage_type,
      usage_date: new Date(),
      quantity,
      data_size_kb: dto.data_size_kb,
      unit_price: unitPrice,
      total_cost: totalCost,
      is_free: isFree,
      metadata: dto.metadata,
    });

    await this.subscriptionRepo.save(subscription);
    const saved = await this.usageRepo.save(usageRecord);

    // Check low balance
    if (
      plan.plan_type === 'payg' &&
      Number(subscription.balance) < Number(subscription.low_balance_threshold)
    ) {
      await this.handleLowBalance(subscription);
    }

    return saved;
  }

  private async handleLowBalance(subscription: Subscription): Promise<void> {
    // Auto top-up if enabled
    if (
      subscription.auto_topup_enabled &&
      subscription.auto_topup_amount &&
      subscription.auto_topup_trigger
    ) {
      if (
        Number(subscription.balance) <= Number(subscription.auto_topup_trigger)
      ) {
        // Here you would trigger auto top-up via payment service
        console.log(
          `Auto top-up triggered for subscription ${subscription.id}`,
        );
        // await this.paymentService.processAutoTopup(subscription);
      }
    }

    // Send low balance notification
    // await this.notificationService.sendLowBalanceAlert(subscription);
  }

  async getUsageReport(dto: UsageReportDto) {
    const subscription = await this.findOne(dto.subscription_id);

    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);

    const usage = await this.usageRepo.find({
      where: {
        subscription_id: dto.subscription_id,
        usage_date: Between(startDate, endDate),
      },
      order: { usage_date: 'ASC' },
    });

    // Calculate totals
    const summary = {
      total_cost: 0,
      total_readings: 0,
      total_alerts: 0,
      total_data_kb: 0,
      by_type: {} as Record<string, any>,
      by_day: {} as Record<string, any>,
    };

    usage.forEach((record) => {
      summary.total_cost += Number(record.total_cost);

      if (record.usage_type === 'reading') {
        summary.total_readings += record.quantity;
      } else if (record.usage_type === 'alert') {
        summary.total_alerts += record.quantity;
      } else if (record.usage_type === 'data_transfer') {
        summary.total_data_kb += record.data_size_kb || 0;
      }

      // Group by type
      if (!summary.by_type[record.usage_type]) {
        summary.by_type[record.usage_type] = {
          count: 0,
          total_cost: 0,
        };
      }
      summary.by_type[record.usage_type].count += record.quantity;
      summary.by_type[record.usage_type].total_cost += Number(
        record.total_cost,
      );

      // Group by day
      const day = record.usage_date.toISOString().split('T')[0];
      if (!summary.by_day[day]) {
        summary.by_day[day] = { count: 0, cost: 0 };
      }
      summary.by_day[day].count += record.quantity;
      summary.by_day[day].cost += Number(record.total_cost);
    });

    return {
      subscription,
      period: { start: startDate, end: endDate },
      summary,
      records: usage,
    };
  }

  async cancel(
    id: string,
    reason?: string,
    notes?: string,
  ): Promise<Subscription> {
    const subscription = await this.findOne(id);

    subscription.status = 'cancelled';
    subscription.cancelled_at = new Date();
    subscription.cancellation_reason = reason || null;
    subscription.cancellation_notes = notes || null;
    subscription.auto_renew = false;

    return await this.subscriptionRepo.save(subscription);
  }

  async suspend(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);
    subscription.status = 'suspended';
    return await this.subscriptionRepo.save(subscription);
  }

  async reactivate(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (
      subscription.status !== 'suspended' &&
      subscription.status !== 'cancelled'
    ) {
      throw new BadRequestException(
        'Can only reactivate suspended or cancelled subscriptions',
      );
    }

    subscription.status = 'active';
    subscription.cancelled_at = null;
    return await this.subscriptionRepo.save(subscription);
  }

  // Cron job to check expiring subscriptions
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiringSubscriptions() {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const expiring = await this.subscriptionRepo.find({
      where: {
        status: 'active',
        end_date: Between(today, threeDaysFromNow),
      },
      relations: ['user', 'plan'],
    });

    for (const subscription of expiring) {
      // Send expiration notification
      console.log(`Subscription ${subscription.id} expiring soon`);
      // await this.notificationService.sendExpirationNotice(subscription);
    }
  }

  // Cron job to handle renewals
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async processRenewals() {
    const today = new Date();

    const toRenew = await this.subscriptionRepo.find({
      where: {
        status: 'active',
        auto_renew: true,
        next_billing_date: LessThan(today),
      },
      relations: ['plan'],
    });

    for (const subscription of toRenew) {
      await this.renewSubscription(subscription);
    }
  }

  private async renewSubscription(subscription: Subscription): Promise<void> {
    const plan = subscription.plan;

    // Calculate new billing period
    const newStart = new Date(subscription.next_billing_date);
    const newEnd = new Date(newStart);

    if (plan.plan_type === 'monthly') {
      newEnd.setMonth(newEnd.getMonth() + 1);
    } else if (plan.plan_type === 'quarterly') {
      newEnd.setMonth(newEnd.getMonth() + 3);
    } else if (plan.plan_type === 'annual') {
      newEnd.setFullYear(newEnd.getFullYear() + 1);
    }

    subscription.current_period_start = newStart;
    subscription.current_period_end = newEnd;
    subscription.next_billing_date = newEnd;
    subscription.end_date = newEnd;

    // Reset usage counters
    subscription.current_readings_count = 0;
    subscription.current_alerts_count = 0;
    subscription.current_data_usage_kb = 0;
    subscription.current_charges = 0;

    await this.subscriptionRepo.save(subscription);

    // Create invoice
    // await this.createInvoice(subscription);
  }
}
