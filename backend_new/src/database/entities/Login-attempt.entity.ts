import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  identifier: string; // email or phone_number

  @Column({ type: 'inet' })
  ip_address: string;

  @Column({ type: 'boolean' })
  success: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
