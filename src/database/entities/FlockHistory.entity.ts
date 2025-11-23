import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.entity';
import { Flock } from './Flock.entity';

@Entity('flock_history')
export class FlockHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  created_by_user?: User;

  @Column({ type: 'uuid' })
  flock_id: string;

  @ManyToOne(() => Flock)
  @JoinColumn({ name: 'flock_id' })
  flock: Flock;

  @Column({ type: 'integer' })
  previous_count: number;

  @Column({ type: 'integer', nullable: true })
  current_count?: number;

  @Column({ type: 'date', nullable: true })
  hatch_date?: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  expected_end_date?: string;

  @Column({ type: 'date', nullable: true })
  actual_end_date?: string;

  @Column({ type: 'varchar', default: 'active' })
  flock_status: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
