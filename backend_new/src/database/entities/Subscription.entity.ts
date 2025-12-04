
// database/entities/Subscription.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';
import { SubscriptionPlan } from './SubscriptionPlan.entity';
import { Device } from './Device.entity';
import { UsageRecord } from './UsageRecord.entity';
import { SubscriptionInvoice } from './SubscriptionInvoice.entity';

@Entity('subscriptions')
@Index('idx_subscriptions_user', ['user_id'])
@Index('idx_subscriptions_plan', ['plan_id'])
@Index('idx_subscriptions_status', ['status'])
@Index('idx_subscriptions_dates', ['start_date', 'end_date'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid' })
  plan_id: string;

  @ManyToOne(() => SubscriptionPlan, plan => plan.subscriptions)
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string; // active, suspended, cancelled, expired, trial

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'date', nullable: true })
  next_billing_date: Date;

  @Column({ type: 'date', nullable: true })
  trial_end_date: Date;

  @Column({ type: 'boolean', default: false })
  auto_renew: boolean;

  // Current billing cycle
  @Column({ type: 'date', nullable: true })
  current_period_start: Date;

  @Column({ type: 'date', nullable: true })
  current_period_end: Date;

  // PAYG Balance
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number; // Prepaid balance for PAYG

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  low_balance_threshold: number; // Alert when balance drops below this

  @Column({ type: 'boolean', default: false })
  auto_topup_enabled: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  auto_topup_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  auto_topup_trigger: number;

  // Usage limits (overrides plan defaults)
  @Column({ type: 'integer', nullable: true })
  custom_max_devices: number;

  @Column({ type: 'integer', nullable: true })
  custom_max_readings_per_day: number;

  @Column({ type: 'integer', nullable: true })
  custom_max_alerts_per_day: number;

  // Current usage counters (reset per billing cycle)
  @Column({ type: 'integer', default: 0 })
  current_readings_count: number;

  @Column({ type: 'integer', default: 0 })
  current_alerts_count: number;

  @Column({ type: 'bigint', default: 0 })
  current_data_usage_kb: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  current_charges: number; // Accumulated charges for current period

  // Lifetime statistics
  @Column({ type: 'bigint', default: 0 })
  total_readings: number;

  @Column({ type: 'bigint', default: 0 })
  total_alerts: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  total_spent: number;

  // Cancellation
  @Column({ type: 'date', nullable: true })
  cancelled_at: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cancellation_reason: string | null;

  @Column({ type: 'text', nullable: true })
  cancellation_notes: string | null;

  // Discount
  @Column({ type: 'varchar', length: 100, nullable: true })
  discount_code: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    activation_source?: string;
    referral_code?: string;
    campaign_id?: string;
    notes?: string;
  };

  @OneToMany(() => Device, device => device.subscription)
  devices: Device[];

  @OneToMany(() => UsageRecord, usage => usage.subscription)
  usage_records: UsageRecord[];

  @OneToMany(() => SubscriptionInvoice, invoice => invoice.subscription)
  invoices: SubscriptionInvoice[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
