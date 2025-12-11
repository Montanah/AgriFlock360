// devices/entities/firmware.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('firmware_versions')
@Index('idx_firmware_version', ['version'])
@Index('idx_firmware_device_type', ['device_type'])
export class FirmwareVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  version: string; // e.g., "1.2.3"

  @Column({ type: 'varchar', length: 50 })
  device_type: string; // e.g., "smart_brooder"

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'text' })
  changelog: string;

  @Column({ type: 'text' })
  file_url: string; // S3/CDN URL

  @Column({ type: 'varchar', length: 64 })
  file_hash: string; // SHA256 checksum

  @Column({ type: 'bigint' })
  file_size: number; // bytes

  @Column({ type: 'varchar', length: 20, default: 'stable' })
  release_type: string; // stable, beta, alpha

  @Column({ type: 'boolean', default: false })
  is_mandatory: boolean;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: string; // draft, released, deprecated

  @Column({ type: 'varchar', length: 50, nullable: true })
  min_version: string; // Minimum version that can upgrade to this

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    features?: string[];
    fixes?: string[];
    breaking_changes?: string[];
    rollout_percentage?: number; // For gradual rollout
  };

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  released_at: Date;
}
