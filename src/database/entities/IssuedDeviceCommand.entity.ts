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
import { CommandType } from './CommandType.entity';

export type CommandStatus =
  | 'pending'
  | 'sent'
  | 'acknowledged'
  | 'failed'
  | 'expired';

@Entity('issued_device_commands')
@Index('idx_issued_commands_device', ['device_id'])
@Index('idx_commands_status', ['command_status'])
export class IssuedDeviceCommand {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  device_id: string;

  @ManyToOne(() => Device, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @Column({ type: 'uuid', nullable: true })
  issued_by?: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'issued_by' })
  issued_by_user?: User;

  @Column({ type: 'uuid', nullable: true })
  command_type_id?: string;

  @ManyToOne(() => CommandType)
  @JoinColumn({ name: 'command_type_id' })
  command_type?: CommandType;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'varchar', default: 'pending' })
  command_status: CommandStatus;

  @Column({ type: 'jsonb', nullable: true })
  response?: Record<string, any>;

  @Column({ type: 'timestamptz', nullable: true })
  sent_at?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  acknowledged_at?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at?: Date;
}
