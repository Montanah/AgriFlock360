// devices/entities/ota-update.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Device } from './Device.entity';
import { FirmwareVersion } from './Firmware.entity';

@Entity('ota_updates')
@Index('idx_ota_device', ['device_id'])
@Index('idx_ota_status', ['status'])
@Index('idx_ota_scheduled', ['scheduled_at'])
export class OtaUpdate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  device_id: string;

  @ManyToOne(() => Device, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'uuid' })
  firmware_id: string;

  @ManyToOne(() => FirmwareVersion)
  @JoinColumn({ name: 'firmware_id' })
  firmware: FirmwareVersion;

  @Column({ type: 'varchar', length: 50, nullable: true })
  current_version: string;

  @Column({ type: 'varchar', length: 50 })
  target_version: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: string; // pending, downloading, installing, completed, failed, cancelled

  @Column({ type: 'integer', default: 0 })
  progress: number; // 0-100

  @Column({ type: 'timestamptz', nullable: true })
  scheduled_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  started_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completed_at: Date;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'integer', default: 0 })
  retry_count: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    download_speed?: number;
    installation_time?: number;
    rollback_version?: string;
  };

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
