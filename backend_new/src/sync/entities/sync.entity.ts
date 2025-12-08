import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum OperationType {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum EntityType {
  FARM = 'FARM',
  BATCH = 'BATCH',
  DEVICE = 'DEVICE',
  VACCINATION = 'VACCINATION',
  FEEDING_RECORD = 'FEEDING_RECORD',
  INVENTORY = 'INVENTORY',
  PRODUCTS = 'PRODUCTS',
}

export enum SyncStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SYNCED = 'SYNCED',
  CONFLICT = 'CONFLICT',
  FAILED = 'FAILED',
}

@Entity('syncs')
@Index('idx_sync_user', ['user_id'])
@Index('idx_sync_status', ['status'])
export class Sync {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  // Operation ID from the client app
  @Column({ type: 'varchar', length: 255 })
  operation_id: string;

  @Column({
    type: 'enum',
    enum: OperationType,
  })
  operation_type: OperationType;

  @Column({
    type: 'enum',
    enum: EntityType,
  })
  entity_type: EntityType;

  // Client-side entity ID
  @Column({ type: 'varchar', length: 255, nullable: true })
  entity_id: string | null;

  // Server-side entity ID (after creation or matching)
  @Column({ type: 'varchar', length: 255, nullable: true })
  server_entity_id: string | null;

  // Operation data
  @Column({ type: 'jsonb' })
  operation_data: any;

  // Current sync status
  @Column({
    type: 'enum',
    enum: SyncStatus,
    default: SyncStatus.PENDING,
  })
  status: SyncStatus;

  // Reason for conflict or failure
  @Column({ type: 'text', nullable: true })
  conflict_reason: string | null;

  // Server version/timestamp for conflict resolution
  @Column({ type: 'bigint', nullable: true })
  server_version: number | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
