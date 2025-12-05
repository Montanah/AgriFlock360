// database/entities/UsageRecord.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Subscription } from './Subscription.entity';
import { Device } from './Device.entity';

@Entity('usage_records')
@Index('idx_usage_records_subscription', ['subscription_id'])
@Index('idx_usage_records_device', ['device_id'])
@Index('idx_usage_records_date', ['usage_date'])
@Index('idx_usage_records_type', ['usage_type'])
export class UsageRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  subscription_id: string;

  @ManyToOne(() => Subscription, (sub) => sub.usage_records, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ type: 'uuid', nullable: true })
  device_id: string;

  @ManyToOne(() => Device, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'varchar', length: 100 })
  usage_type: string; // reading, alert, data_transfer, device_day, base_fee

  @Column({ type: 'timestamptz' })
  usage_date: Date;

  @Column({ type: 'integer', default: 1 })
  quantity: number; // Number of units used

  @Column({ type: 'bigint', nullable: true })
  data_size_kb: number; // For data transfer

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_cost: number;

  @Column({ type: 'boolean', default: false })
  is_free: boolean; // Within free tier

  @Column({ type: 'boolean', default: false })
  is_billed: boolean;

  @Column({ type: 'uuid', nullable: true })
  invoice_id: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    sensor_type?: string;
    alert_type?: string;
    data_points?: number;
    description?: string;
  };

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
