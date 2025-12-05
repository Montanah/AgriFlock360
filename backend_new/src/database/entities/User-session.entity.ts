import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text' })
  refresh_token_hash: string;

  @Column({ type: 'inet' })
  ip_address: string;

  @Column({ type: 'text' })
  user_agent: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamptz' })
  expires_at: Date;

  @Column({ type: 'timestamptz' })
  last_activity: Date;

  @Column({ type: 'timestamptz', nullable: true })
  invalidated_at: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
