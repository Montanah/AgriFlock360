import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Flock } from './Flock.entity';
import { FeedingSchedule } from './FeedingSchedule.entity';
import { User } from './User.entity';

@Entity('feeding_records')
@Index('idx_feeding_records_flock', ['flock_id'])
@Index('idx_feeding_records_date', { synchronize: false })
export class FeedingRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  flock_id: string;

  @ManyToOne(() => Flock, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flock_id' })
  flock: Flock;

  @Column({ type: 'uuid', nullable: true })
  schedule_id?: string;

  @ManyToOne(() => FeedingSchedule, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'schedule_id' })
  schedule?: FeedingSchedule;

  @Column({ type: 'varchar', length: 100 })
  feed_type: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number; // kg

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  fed_at: Date;

  @Column({ type: 'uuid', nullable: true })
  recorded_by?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by' })
  recorded_by_user?: User;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
