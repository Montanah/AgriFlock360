import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Device } from './Device.entity';

@Entity('telemetry')
@Index('idx_telemetry_device_time', ['device_id', 'timestamp'])
@Index('idx_telemetry_timestamp', ['timestamp'])
export class Telemetry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  device_id: string;

  @ManyToOne(() => Device, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  temperature?: number; // Celsius

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  humidity?: number; // Percentage

  @Column({ type: 'boolean', default: false })
  heater_status: boolean;

  @Column({ type: 'boolean', default: false })
  fan_status: boolean;

  @Column({ type: 'boolean', default: true })
  power_status: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  error_code?: string;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}
