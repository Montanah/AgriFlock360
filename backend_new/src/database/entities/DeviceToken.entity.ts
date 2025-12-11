// database/entities/DeviceToken.entity.ts
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

@Entity('device_tokens')
@Index('idx_device_tokens_user', ['user_id'])
@Index('idx_device_tokens_token', ['device_token'])
export class DeviceToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text' })
  device_token: string;

  @Column({ type: 'varchar', length: 20 })
  platform: string; // 'ios', 'android', 'web'

  @Column({ type: 'varchar', length: 255, nullable: true })
  device_name?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  device_model?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  os_version?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  app_version?: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  last_used_at?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
