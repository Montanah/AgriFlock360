import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Device } from './Device.entity';
import { Payment } from './Payment.entity';

export type PaygTransactionType = 'credit' | 'debit' | 'unlock' | 'lock';

@Entity('payg_transactions')
@Index('idx_payg_device', ['device_id'])
@Index('idx_payg_created', { synchronize: false })
export class PaygTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  device_id: string;

  @ManyToOne(() => Device, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'uuid', nullable: true })
  payment_id?: string;

  @ManyToOne(() => Payment, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;

  @Column({ type: 'varchar', length: 20 })
  transaction_type: PaygTransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance_before: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance_after: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
