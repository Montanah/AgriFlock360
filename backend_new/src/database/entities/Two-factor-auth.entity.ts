import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('two_factor_auth')
export class TwoFactorAuth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text' })
  secret: string;

  @Column({ type: 'boolean', default: false })
  is_enabled: boolean;

  @Column({ type: 'simple-array', nullable: true })
  backup_codes: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
