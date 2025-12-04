// database/entities/SubscriptionInvoice.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Subscription } from './Subscription.entity';
import { Payment } from './Payment.entity';

@Entity('subscription_invoices')
@Index('idx_subscription_invoices_subscription', ['subscription_id'])
@Index('idx_subscription_invoices_status', ['status'])
@Index('idx_subscription_invoices_date', ['invoice_date'])
export class SubscriptionInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  invoice_number: string;

  @Column({ type: 'uuid' })
  subscription_id: string;

  @ManyToOne(() => Subscription, sub => sub.invoices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ type: 'date' })
  invoice_date: Date;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'date' })
  period_start: Date;

  @Column({ type: 'date' })
  period_end: Date;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string; // pending, paid, overdue, cancelled, refunded

  // Amounts
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount_paid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  balance: number;

  // Usage breakdown
  @Column({ type: 'jsonb', nullable: true })
  usage_summary: {
    base_fee?: number;
    total_readings?: number;
    readings_cost?: number;
    total_alerts?: number;
    alerts_cost?: number;
    total_data_kb?: number;
    data_cost?: number;
    device_days?: number;
    device_cost?: number;
    other_charges?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  line_items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    amount: number;
  }>;

  @Column({ type: 'uuid', nullable: true })
  payment_id: string;

  @ManyToOne(() => Payment, { nullable: true })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({ type: 'date', nullable: true })
  paid_at: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    payment_method?: string;
    transaction_id?: string;
    receipt_url?: string;
  };

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}