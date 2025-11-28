import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Batch } from './Batch.entity';
import { User } from './User.entity';

@Entity('weight_samples')
@Index('idx_weight_samples_batch', ['batch_id'])
@Index('idx_weight_samples_date', ['sample_date'])
export class WeightSample {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  batch_id?: string;

  @ManyToOne(() => Batch)
  @JoinColumn({ name: 'batch_id' })
  batch?: Batch;

  @Column({ type: 'date', nullable: true })
  sample_date?: string;

  @Column({ type: 'integer', default: 10 })
  sample_size: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  average_weight_grams?: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  min_weight_grams: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  max_weight_grams: number;

  @Column({ type: 'uuid', nullable: true })
  recorded_by?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_by' })
  recorded_by_user?: User;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
