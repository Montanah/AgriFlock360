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
import { Batch } from './Batch.entity';
import { FeedingRecommendation } from './FeedingRecommendation.entity';

@Entity('feeding_schedules')
@Index('idx_feeding_batch', ['batch_id'])
export class FeedingSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  batch_id: string;

  @ManyToOne(() => Batch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  @Column({ type: 'uuid', nullable: true })
  recommendation_id: string;

  @ManyToOne(() => FeedingRecommendation, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'recommendation_id' })
  recommendation: FeedingRecommendation;

  @Column({ type: 'varchar', length: 100 })
  feed_type: string; // e.g., 'Starter', 'Grower'

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity_per_day: number; // kg

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  end_date?: string;

  @Column({ type: 'integer', default: 2 })
  times_per_day: number;

  @Column({ type: 'jsonb', nullable: true })
  feeding_times: {
    slots: string[];
  };

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'varchar', length: 50, default: 'manual' })
  source: string; // 'recommendation' or 'manual'

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
