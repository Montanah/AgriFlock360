// services/subscription-billing.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../database/entities/Subscription.entity';
import { Device } from '../database/entities/Device.entity';
import { DeviceStatus } from '../database/entities/DeviceStatus.entity';
import { SubscriptionService } from './subscription.service';

@Injectable()
export class SubscriptionBillingService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    @InjectRepository(DeviceStatus)
    private readonly deviceStatusRepo: Repository<DeviceStatus>,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  /**
   * Daily job to charge for active devices
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async chargeDailyDeviceFees() {
    console.log('Starting daily device fee charges...');

    const activeSubscriptions = await this.subscriptionRepo.find({
      where: { status: 'active' },
      relations: ['plan', 'devices', 'devices.device_status'],
    });

    for (const subscription of activeSubscriptions) {
      if (subscription.plan.plan_type !== 'payg') {
        continue; // Skip non-PAYG plans
      }

      const activeDevices = subscription.devices.filter(
        (d) => d.device_status.name === 'active',
      );

      for (const device of activeDevices) {
        try {
          await this.subscriptionService.recordUsage({
            subscription_id: subscription.id,
            device_id: device.id,
            usage_type: 'device_day',
            quantity: 1,
            metadata: {
              description: 'Daily device fee',
              device_name: device.device_name,
            },
          });
        } catch (error) {
          console.error(
            `Failed to charge device ${device.id}: ${error.message}`,
          );
          // If insufficient balance, suspend device
          if (error.message.includes('Insufficient balance')) {
            const suspendedStatus = await this.deviceStatusRepo.findOne({
              where: { name: 'suspended' },
            });
            if (suspendedStatus) {
              device.device_status_id = suspendedStatus.id;
              await this.deviceRepo.save(device);
            }
          }
        }
      }
    }

    console.log('Daily device fee charges completed');
  }

  /**
   * Monthly job to charge base fees
   */
  @Cron('0 0 1 * *') // First day of month at midnight
  async chargeMonthlyBaseFees() {
    console.log('Charging monthly base fees...');

    const activeSubscriptions = await this.subscriptionRepo.find({
      where: { status: 'active' },
      relations: ['plan'],
    });

    for (const subscription of activeSubscriptions) {
      if (subscription.plan.base_fee > 0) {
        try {
          await this.subscriptionService.recordUsage({
            subscription_id: subscription.id,
            usage_type: 'base_fee',
            quantity: 1,
            metadata: {
              description: 'Monthly base fee',
              month: new Date().toISOString().substring(0, 7),
            },
          });
        } catch (error) {
          console.error(
            `Failed to charge base fee for subscription ${subscription.id}: ${error.message}`,
          );
        }
      }
    }
  }
}
