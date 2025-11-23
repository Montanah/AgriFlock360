import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Device } from './Device.entity';
import { User } from './User.entity';

@Entity('payments')
@Index('idx_payments_user', ['user_id'])
@Index('idx_payments_device', ['device_id'])
@Index('idx_payments_status', ['status'])
@Index('idx_payments_transaction_ref', ['transaction_ref'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  device_id?: string;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device?: Device;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  base_currency_rate?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  base_currency?: number;

  @Column({ type: 'varchar', length: 3, default: 'KES' })
  currency: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  payment_method?: string;

  @Column({ type: 'varchar', nullable: true })
  payment_purpose?: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'completed' | 'failed';

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  transaction_ref?: string; // M-Pesa/Airtel ref

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone_number?: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  transaction_date: Date;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>; // Raw provider response

  @Column({ type: 'timestamptz', nullable: true })
  processed_at?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
