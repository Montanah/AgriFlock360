// modules/subscription.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { Subscription } from '../database/entities/Subscription.entity';
import { SubscriptionPlan } from '../database/entities/SubscriptionPlan.entity';
import { UsageRecord } from '../database/entities/UsageRecord.entity';
import { SubscriptionInvoice } from '../database/entities/SubscriptionInvoice.entity';
import { User } from '../database/entities/User.entity';
import { Device } from '../database/entities/Device.entity';
import { DeviceStatus } from 'src/database/entities';
import { Payment } from '../database/entities/Payment.entity';
import { SubscriptionService } from './subscription.service';
import { SubscriptionPlanService } from './subscription-plan.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionPlanController } from './subscription-plan.controller';
import { UsageController } from './usage.controller';
import { SubscriptionWebhookController } from './subscription-webhook.controller';
import { IoTSubscriptionIntegrationService } from './iot-subscription-integration.service';
import { SubscriptionPaymentService } from './subscription-payment.service';
import { SubscriptionBillingService } from './subscription-billing.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      SubscriptionPlan,
      UsageRecord,
      SubscriptionInvoice,
      User,
      Device,
      Payment,
      DeviceStatus,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    SubscriptionController,
    SubscriptionPlanController,
    UsageController,
    SubscriptionWebhookController,
  ],
  providers: [
    SubscriptionService,
    SubscriptionPlanService,
    SubscriptionPaymentService,
    IoTSubscriptionIntegrationService,
    SubscriptionBillingService,
  ],
  exports: [
    SubscriptionService,
    SubscriptionPlanService,
    SubscriptionPaymentService,
    IoTSubscriptionIntegrationService,
  ],
})
export class SubscriptionModule {}
