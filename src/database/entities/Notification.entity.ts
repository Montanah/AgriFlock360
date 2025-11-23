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

export type NotificationType = 'info' | 'reminder' | 'deadline' | 'warning';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'uuid', nullable: true })
  entity_type?: string; // Fixed from schema

  @Column({ type: 'uuid', nullable: true })
  entity_id?: string;

  @Column({ type: 'text', nullable: true })
  body?: string;

  @Column({ type: 'varchar', default: 'info' })
  type: NotificationType;

  @Column({ type: 'text', default: 'email' })
  delivery_channel: string;

  @Column({ type: 'boolean', default: false })
  is_read: boolean;

  @Column({ type: 'boolean', default: false })
  is_sent: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  sent_at?: Date;

  @Column({ type: 'timestamptz', nullable: true })
  read_at?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
