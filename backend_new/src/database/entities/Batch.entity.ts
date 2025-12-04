// database/entities/Batch.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeUpdate,
} from 'typeorm';
import { User } from './User.entity';
import { Device } from './Device.entity';
import { Farm } from './Farm.entity';
import { BatchHistory } from './BatchHistory.entity';
import { BirdType } from './BirdType.entity';
import { Vaccination } from './Vaccination.entity';
import { FeedingSchedule } from './FeedingSchedule.entity';
import { FeedingRecord } from './FeedingRecord.entity';
import { WeightSample } from './WeightSample.entity';

export enum BatchStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

@Entity('batchs')
@Index('idx_batchs_user', ['user_id'])
@Index('idx_batchs_device', ['device_id'])
@Index('idx_batchs_farm', ['farm_id'])
@Index('idx_batchs_status', ['current_status'])
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  farm_id: string;

  @ManyToOne(() => Farm, (farm) => farm.batchs)
  @JoinColumn({ name: 'farm_id' })
  farm: Farm;

  @Column({ type: 'uuid', nullable: true })
  device_id: string;

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'varchar', length: 100, nullable: true })
  breed: string;

  @Column({ type: 'varchar', length: 255 })
  batch_name: string;

  @Column({ type: 'uuid', nullable: true })
  bird_type_id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  batch_type: string;

  @ManyToOne(() => BirdType)
  @JoinColumn({ name: 'bird_type_id' })
  bird_type: BirdType;

  @Column({ type: 'integer' })
  age: number;  

  @Column({ type: 'integer' })
  birds_alive: number;

  @Column({ type: 'integer' })
  current_weight: number;

  @Column({ type: 'integer' })
  expected_weight: number;

  @Column ({ type: 'varchar', length: 255, nullable: true })
  feeding_time: string;

  @Column({ type: 'jsonb', nullable: true })
  feeding_schedule: string[];

  @Column({ type: 'integer' })
  current_count: number;

  @Column({ type: 'integer' })
  initial_count: number;

  @Column({ type: 'date', nullable: true })
  hatch_date: Date;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  expected_end_date: Date;

  @Column({ type: 'date', nullable: true })
  actual_end_date: Date;

  @Column({ type: 'enum', enum: BatchStatus, default: BatchStatus.ACTIVE })
  current_status: BatchStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => BatchHistory, (history) => history.batch)
  history: BatchHistory[];

  @OneToMany(() => Vaccination, (vaccination) => vaccination.batch)
  vaccinations: Vaccination[];

  @OneToMany(() => FeedingSchedule, (schedule) => schedule.batch)
  feeding_schedules: FeedingSchedule[];

  @OneToMany(() => FeedingRecord, (record) => record.batch)
  feeding_records: FeedingRecord[];

  @OneToMany(() => WeightSample, (sample) => sample.batch)
  weight_samples: WeightSample[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  batchPhoto: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @BeforeUpdate()
  async beforeUpdate() {
    this.updated_at = new Date();
  }
}
