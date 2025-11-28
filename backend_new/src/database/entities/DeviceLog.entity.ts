import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Device } from './Device.entity';

@Entity('device_logs')
@Index('idx_logs_device_time', ['device_id', 'timestamp'])
export class DeviceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  device_id: string;

  @ManyToOne(() => Device, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'varchar', length: 20 })
  log_level: 'debug' | 'info' | 'warning' | 'error';

  @Column({ type: 'varchar', length: 50 })
  event_type: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;
}
