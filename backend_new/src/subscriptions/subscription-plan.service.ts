// services/subscription-plan.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from '../database/entities/SubscriptionPlan.entity';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
} from './dto/subscriptions.dto';

@Injectable()
export class SubscriptionPlanService {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) {}

  async create(dto: CreateSubscriptionPlanDto): Promise<SubscriptionPlan> {
    // Check for duplicate name
    const existing = await this.planRepo.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Plan with this name already exists');
    }

    const plan = this.planRepo.create(dto);
    return await this.planRepo.save(plan);
  }

  async findAll(includeInactive = false): Promise<SubscriptionPlan[]> {
    const query: any = {};

    if (!includeInactive) {
      query.is_active = true;
    }

    return await this.planRepo.find({
      where: query,
      order: { sort_order: 'ASC', created_at: 'ASC' },
    });
  }

  async findPublic(): Promise<SubscriptionPlan[]> {
    return await this.planRepo.find({
      where: { is_active: true, is_public: true },
      order: { sort_order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<SubscriptionPlan> {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ['subscriptions'],
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    return plan;
  }

  async findByType(planType: string): Promise<SubscriptionPlan[]> {
    return await this.planRepo.find({
      where: { plan_type: planType, is_active: true },
      order: { sort_order: 'ASC' },
    });
  }

  async update(
    id: string,
    dto: UpdateSubscriptionPlanDto,
  ): Promise<SubscriptionPlan> {
    const plan = await this.findOne(id);

    // Check for duplicate name if changing
    if (dto.name && dto.name !== plan.name) {
      const existing = await this.planRepo.findOne({
        where: { name: dto.name },
      });

      if (existing) {
        throw new ConflictException('Plan with this name already exists');
      }
    }

    Object.assign(plan, dto);
    return await this.planRepo.save(plan);
  }

  async activate(id: string): Promise<SubscriptionPlan> {
    const plan = await this.findOne(id);
    plan.is_active = true;
    return await this.planRepo.save(plan);
  }

  async deactivate(id: string): Promise<SubscriptionPlan> {
    const plan = await this.findOne(id);
    plan.is_active = false;
    return await this.planRepo.save(plan);
  }

  async delete(id: string): Promise<void> {
    const plan = await this.findOne(id);

    // Check if plan has active subscriptions
    if (plan.subscriptions && plan.subscriptions.length > 0) {
      const activeCount = plan.subscriptions.filter(
        (s) => s.status === 'active',
      ).length;

      if (activeCount > 0) {
        throw new ConflictException(
          `Cannot delete plan with ${activeCount} active subscription(s)`,
        );
      }
    }

    await this.planRepo.remove(plan);
  }

  async calculateEstimatedCost(
    planId: string,
    estimatedUsage: {
      devices?: number;
      readings_per_day?: number;
      alerts_per_day?: number;
      data_kb_per_day?: number;
    },
  ): Promise<{
    plan: SubscriptionPlan;
    monthly_estimate: number;
    breakdown: any;
  }> {
    const plan = await this.findOne(planId);

    if (plan.plan_type === 'payg') {
      const daysInMonth = 30;
      const devices = estimatedUsage.devices || 1;
      const readingsPerDay = estimatedUsage.readings_per_day || 0;
      const alertsPerDay = estimatedUsage.alerts_per_day || 0;
      const dataKbPerDay = estimatedUsage.data_kb_per_day || 0;

      const totalReadings = readingsPerDay * daysInMonth;
      const totalAlerts = alertsPerDay * daysInMonth;
      const totalDataKb = dataKbPerDay * daysInMonth;

      const freeReadings = Math.min(
        totalReadings,
        plan.free_readings_per_month,
      );
      const billableReadings = Math.max(0, totalReadings - freeReadings);

      const freeAlerts = Math.min(totalAlerts, plan.free_alerts_per_month);
      const billableAlerts = Math.max(0, totalAlerts - freeAlerts);

      const breakdown = {
        base_fee: Number(plan.base_fee),
        device_cost: devices * daysInMonth * Number(plan.per_device_fee),
        readings_cost: billableReadings * Number(plan.per_reading_fee),
        alerts_cost: billableAlerts * Number(plan.per_alert_fee),
        data_cost: totalDataKb * Number(plan.per_kb_fee),
        free_readings: freeReadings,
        free_alerts: freeAlerts,
        billable_readings: billableReadings,
        billable_alerts: billableAlerts,
      };

      const monthlyEstimate =
        breakdown.base_fee +
        breakdown.device_cost +
        breakdown.readings_cost +
        breakdown.alerts_cost +
        breakdown.data_cost;

      return {
        plan,
        monthly_estimate: Number(monthlyEstimate.toFixed(2)),
        breakdown,
      };
    } else {
      // Fixed pricing
      return {
        plan,
        monthly_estimate: Number(plan.monthly_price || 0),
        breakdown: {
          fixed_price: Number(plan.monthly_price || 0),
          plan_type: plan.plan_type,
        },
      };
    }
  }

  async getRecommendedPlans(): Promise<SubscriptionPlan[]> {
    return await this.planRepo.find({
      where: {
        is_active: true,
        is_public: true,
      },
      order: { sort_order: 'ASC' },
    });
  }

  async getStatistics(planId: string) {
    const plan = await this.findOne(planId);

    const activeSubscriptions = plan.subscriptions.filter(
      (s) => s.status === 'active',
    ).length;

    const totalRevenue = plan.subscriptions.reduce(
      (sum, s) => sum + Number(s.total_spent),
      0,
    );

    const avgMonthlyRevenue =
      activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0;

    return {
      plan_name: plan.name,
      total_subscriptions: plan.subscriptions.length,
      active_subscriptions: activeSubscriptions,
      total_revenue: Number(totalRevenue.toFixed(2)),
      average_monthly_revenue: Number(avgMonthlyRevenue.toFixed(2)),
      by_status: {
        active: plan.subscriptions.filter((s) => s.status === 'active').length,
        trial: plan.subscriptions.filter((s) => s.status === 'trial').length,
        cancelled: plan.subscriptions.filter((s) => s.status === 'cancelled')
          .length,
        suspended: plan.subscriptions.filter((s) => s.status === 'suspended')
          .length,
        expired: plan.subscriptions.filter((s) => s.status === 'expired')
          .length,
      },
    };
  }
}
