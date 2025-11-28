import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { User } from './User.entity';

type DeliveryMethod =
  | 'email'
  | 'push'
  | 'sms'
  | 'whatsapp'
  | 'telegram'
  | 'slack'
  | 'webhook'
  | 'other';

@Entity('sent_notifications')
@Index('idx_sent_notifications_user_id', ['user_id'])
@Index('idx_sent_notifications_reference', [
  'notification_type',
  'reference_id',
])
@Index('idx_sent_notifications_delivery_method', ['delivery_method'])
export class SentNotification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  notification_type: string;

  @Column({ type: 'uuid' })
  reference_id: string;

  @Column({ type: 'integer' })
  timing_minutes: number;

  @Column({ type: 'text', default: 'email' })
  delivery_method: DeliveryMethod;

  @CreateDateColumn({ type: 'timestamptz' })
  sent_at: Date;

  // Unique constraint
  // @Unique(['user_id', 'notification_type', 'reference_id', 'timing_minutes', 'delivery_method'])  // TypeORM supports this
}
