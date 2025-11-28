import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { Device } from './Device.entity';
import { User } from './User.entity';

export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

@Entity('alerts')
@Index('idx_alerts_device', ['device_id'])
@Index('idx_alerts_user', ['user_id'])
@Index('idx_alerts_status', ['alert_status'])
@Index('idx_alerts_created', ['created_at'])
export class Alert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  device_id: string;

  @ManyToOne(() => Device, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'varchar' })
  severity: AlertSeverity;

  @Column({ type: 'varchar', default: 'active' })
  alert_status: AlertStatus;

  @Column({ type: 'varchar', length: 50 })
  alert_type: string; // e.g., 'high_temp', 'device_offline'

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @Column({ type: 'timestamptz', nullable: true })
  acknowledged_at?: Date;

  @Column({ type: 'uuid', nullable: true })
  acknowledged_by?: string;

  @Column({ type: 'timestamptz', nullable: true })
  resolved_at?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
