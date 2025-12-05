import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
@Index('idx_audit_user', ['user_id'])
@Index('idx_audit_entity', ['entity_type', 'entity_id'])
@Index('idx_audit_created', ['created_at'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id?: string;

  @Column({ type: 'varchar', length: 50 })
  entity_type: string; // 'user', 'device', etc.

  @Column({ type: 'uuid', nullable: true })
  entity_id?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  action?: string;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  changes?: Record<string, any>; // Before/after

  @Column({ type: 'inet', nullable: true })
  ip_address?: string;

  @Column({ type: 'text', nullable: true })
  user_agent?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
