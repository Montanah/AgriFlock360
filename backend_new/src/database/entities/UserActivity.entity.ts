// database/entities/UserActivity.entity.ts (Optional - for tracking login history)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';

@Entity('user_activities')
@Index('idx_user_activities_user', ['user_id'])
@Index('idx_user_activities_type', ['activity_type'])
@Index('idx_user_activities_created', ['created_at'])
export class UserActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  activity_type: string; // 'login', 'logout', 'password_change', '2fa_enabled', etc.

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'inet', nullable: true })
  ip_address?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  location?: string; // City, Country

  @Column({ type: 'varchar', length: 50, nullable: true })
  device_type?: string; // 'mobile', 'desktop', 'tablet'

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}