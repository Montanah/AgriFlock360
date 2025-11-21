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
import { User } from './User.entity';
import { Device } from './Device.entity';

@Entity('flocks')
@Index('idx_flocks_user', ['user_id'])
@Index('idx_flocks_device', ['device_id'])
@Index('idx_flocks_status', ['current_status'])
export class Flock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'uuid', nullable: true })
  device_id?: string;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device?: Device;

  @Column({ type: 'varchar', length: 100, nullable: true })
  breed?: string;

  @Column({ type: 'varchar', length: 255 })
  flock_name: string;

  @Column({ type: 'varchar', length: 20 })
  bird_type: string;

  @Column({ type: 'integer' })
  current_count: number;

  @Column({ type: 'date', nullable: true })
  hatch_date?: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  start_date: string;

  @Column({ type: 'date', nullable: true })
  expected_end_date?: string;

  @Column({ type: 'date', nullable: true })
  actual_end_date?: string;

  @Column({ type: 'varchar', default: 'active' })
  current_status: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
