// database/entities/SubscriptionPlan.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Subscription } from './Subscription.entity';

@Entity('subscription_plans')
@Index('idx_subscription_plans_type', ['plan_type'])
@Index('idx_subscription_plans_active', ['is_active'])
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  plan_type: string; // payg, monthly, quarterly, annual, custom

  @Column({ type: 'text', nullable: true })
  description: string;

  // PAYG Pricing
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  base_fee: number; // Base monthly/activation fee

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  per_reading_fee: number; // Cost per sensor reading

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  per_alert_fee: number; // Cost per alert sent

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  per_device_fee: number; // Daily/monthly fee per device

  // Data usage pricing
  @Column({ type: 'decimal', precision: 10, scale: 4, default: 0 })
  per_kb_fee: number; // Cost per KB of data

  @Column({ type: 'integer', default: 0 })
  free_readings_per_month: number;

  @Column({ type: 'integer', default: 0 })
  free_alerts_per_month: number;

  // Fixed pricing (for non-PAYG plans)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  monthly_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quarterly_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  annual_price: number;

  // Limits
  @Column({ type: 'integer', nullable: true })
  max_devices: number;

  @Column({ type: 'integer', nullable: true })
  max_readings_per_day: number;

  @Column({ type: 'integer', nullable: true })
  max_alerts_per_day: number;

  @Column({ type: 'bigint', nullable: true })
  max_data_per_month_kb: number;

  // Features
  @Column({ type: 'jsonb', nullable: true })
  features: {
    real_time_monitoring?: boolean;
    historical_data_days?: number;
    sms_alerts?: boolean;
    email_alerts?: boolean;
    push_notifications?: boolean;
    api_access?: boolean;
    advanced_analytics?: boolean;
    custom_reports?: boolean;
    priority_support?: boolean;
  };

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: true })
  is_public: boolean; // Visible to customers

  @Column({ type: 'integer', default: 0 })
  sort_order: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    recommended?: boolean;
    popular?: boolean;
    trial_days?: number;
    minimum_commitment_months?: number;
  };

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
