// database/entities/UserPreferences.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User.entity';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'jsonb', nullable: true })
  email_notifications: {
    marketing?: boolean;
    security_alerts?: boolean;
    product_updates?: boolean;
    system_notifications?: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  push_notifications: {
    alerts?: boolean;
    reminders?: boolean;
    messages?: boolean;
    reports?: boolean;
  };

  @Column({ type: 'jsonb', nullable: true })
  privacy_settings: {
    profile_visibility?: string;
    show_email?: boolean;
    show_phone?: boolean;
    show_location?: boolean;
    search_engine_indexing?: boolean;
    analytics_consent?: boolean;
  };

  @Column({ type: 'text', nullable: true })
  two_factor_secret?: string;

  @Column({ type: 'jsonb', nullable: true })
  app_settings: {
    theme?: string;
    language?: string;
    timezone?: string;
    date_format?: string;
  };

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
