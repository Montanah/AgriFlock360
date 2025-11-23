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

export type DeliveryMethod =
  | 'email'
  | 'push'
  | 'sms'
  | 'whatsapp'
  | 'telegram'
  | 'slack'
  | 'webhook'
  | 'other';

@Entity('user_notification_settings')
@Index('idx_user_notification_settings_user_id', ['user_id'])
@Index('idx_user_notification_settings_type', ['notification_type'])
@Index('idx_user_notification_settings_enabled', ['is_enabled'])
@Index('idx_user_notification_settings_delivery_method', ['delivery_method'])
export class UserNotificationSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  notification_type: string;

  @Column({ type: 'integer' })
  timing_minutes: number;

  @Column({
    type: 'text',
    default: 'email',
  })
  delivery_method: DeliveryMethod;

  @Column({ type: 'boolean', default: true })
  is_enabled: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
