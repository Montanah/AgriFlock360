// database/entities/BatchHistory.entity.ts
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
import { User } from './User.entity';
import { Batch } from './Batch.entity';

@Entity('batch_history')
@Index('idx_batch_history_batch', ['batch_id'])
@Index('idx_batch_history_created', ['created_at'])
export class BatchHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  created_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'uuid' })
  batch_id: string;

  @ManyToOne(() => Batch, (batch) => batch.history)
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  @Column({ type: 'integer' })
  previous_count: number;

  @Column({ type: 'integer', nullable: true })
  current_count: number;

  @Column({ type: 'varchar', length: 50 })
  change_type: string; // 'mortality', 'sale', 'transfer', 'initial', 'adjustment'

  @Column({ type: 'integer' })
  change_amount: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'date', nullable: true })
  hatch_date: Date;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  expected_end_date: Date;

  @Column({ type: 'date', nullable: true })
  actual_end_date: Date;

  @Column({ type: 'varchar', length: 20 })
  batch_status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
