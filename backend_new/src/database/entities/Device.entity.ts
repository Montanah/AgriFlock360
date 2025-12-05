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
import { User } from './User.entity';
import { DeviceStatus } from './DeviceStatus.entity';
import { FirmwareVersion } from './Firmware.entity';
import { Subscription } from './Subscription.entity';

@Entity('devices')
@Index('idx_devices_owner', ['owner_id'])
@Index('idx_devices_device_id', ['device_id'], { unique: true })
@Index('idx_devices_firmware_version', ['firmware_version_id'])
export class Device {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  device_id: string; // MAC/Serial

  @Column({ type: 'varchar', length: 255 })
  device_name: string;

  @Column({ type: 'varchar' })
  device_type: string;

  @Column({ type: 'uuid', nullable: true })
  owner_id?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner?: User;

  @Column({ type: 'uuid' })
  device_status_id: string;

  @ManyToOne(() => DeviceStatus)
  @JoinColumn({ name: 'device_status_id' })
  device_status: DeviceStatus;

  @Column({ type: 'uuid', nullable: true })
  firmware_version_id?: string;

  @ManyToOne(() => FirmwareVersion, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'firmware_version_id' })
  firmware_version?: FirmwareVersion;

  @Column({ type: 'timestamptz', nullable: true })
  last_seen?: Date;

  @Column({ type: 'boolean', default: false })
  is_payg_locked: boolean;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  payg_balance: number;

  @Column({ type: 'date', nullable: true })
  installation_date?: Date;

  @Column({ type: 'date', nullable: true })
  warranty_expiry?: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  mqtt_topic_prefix?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  wifi_ssid?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'uuid', nullable: true })
  subscription_id: string;

  @ManyToOne(() => Subscription, (subscription) => subscription.devices, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
