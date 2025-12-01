import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Role } from './Role.entity';
import { Farm } from './Farm.entity';
import { Profile } from './Profile.entity';

export type UserStatus = 'active' | 'inactive' | 'deleted' | 'pending';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'text' })
  password_hash: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone_number: string;

  @Column({ type: 'boolean', default: false })
  is_2fa_enabled: boolean;

  @Column({ type: 'text', nullable: true })
  email_verification_code?: string;

  @Column({ type: 'timestamptz', nullable: true })
  email_verification_expires_at?: Date;

  @Column({ type: 'text', nullable: true })
  refresh_token?: string;

  @Column({ type: 'timestamptz', nullable: true })
  refresh_token_expires_at?: Date;

  @Column({ type: 'text', nullable: true })
  password_reset_token?: string;

  @Column({ type: 'timestamptz', nullable: true })
  password_reset_expires_at?: Date;

  @Column({ type: 'varchar', default: 'active' })
  status: UserStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string | null;

  // Relationship to Profile
  @OneToOne(() => Profile, profile => profile.user, { cascade: true })
  profile?: Profile;

  // OAuth fields
  @Column({ type: 'text', nullable: true })
  google_id: string;

  @Column({ type: 'text', nullable: true })
  apple_id: string;

  @Column({ type: 'text', nullable: true })
  oauth_provider: string; // 'google', 'apple', 'email'

  @Column({ type: 'uuid' })
  role_id: string;

  @ManyToOne(() => Role, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  locked_until?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at?: Date;

  // agree to terms
  @Column({ type: 'boolean', default: false })
  agreed_to_terms: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  agreed_to_terms_at: Date;
}
