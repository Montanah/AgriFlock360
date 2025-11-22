import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Flock } from './Flock.entity';
import { User } from './User.entity';

@Entity('weight_samples')
export class WeightSample {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  flock_id?: string;

  @ManyToOne(() => Flock)
  @JoinColumn({ name: 'flock_id' })
  flock?: Flock;

  @Column({ type: 'date', nullable: true })
  sample_date?: string;

  @Column({ type: 'integer', default: 10 })
  sample_size: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  average_weight_grams?: number;

  @Column({ type: 'uuid', nullable: true })
  recorded_by?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recorded_by' })
  recorded_by_user?: User;
}
