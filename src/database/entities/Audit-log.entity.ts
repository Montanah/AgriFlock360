import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index(['user_id', 'created_at'])
@Index(['entity_type', 'entity_id'])
export class AuditLog {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 50 })
  entity_type: string;

  @Column({ type: 'uuid', nullable: true })
  entity_id: string;

  @Column({ type: 'jsonb', nullable: true })
  meta: any;

  @Column({ type: 'jsonb', nullable: true })
  changes: any;

  @Column({ type: 'inet', nullable: true })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
