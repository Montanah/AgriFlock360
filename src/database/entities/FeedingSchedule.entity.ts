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
import { Flock } from './Flock.entity';

@Entity('feeding_schedules')
@Index('idx_feeding_flock', ['flock_id'])
export class FeedingSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  flock_id: string;

  @ManyToOne(() => Flock, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flock_id' })
  flock: Flock;

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

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
