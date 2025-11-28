// uploads/entities/upload.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';

@Entity('uploads')
@Index('idx_uploads_user', ['user_id'])
@Index('idx_uploads_entity', ['entity_type', 'entity_id'])
@Index('idx_uploads_file_type', ['file_type'])
export class Upload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  original_filename: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string; // Stored filename (with UUID)

  @Column({ type: 'text' })
  file_url: string; // Full URL (S3/CDN)

  @Column({ type: 'varchar', length: 50 })
  file_type: string; // image, document, firmware, video, audio

  @Column({ type: 'varchar', length: 100 })
  mime_type: string; // image/jpeg, application/pdf, etc.

  @Column({ type: 'bigint' })
  file_size: number; // bytes

  @Column({ type: 'varchar', length: 50, nullable: true })
  entity_type: string; // user, device, flock, etc.

  @Column({ type: 'uuid', nullable: true })
  entity_id: string; // ID of the related entity

  @Column({ type: 'varchar', length: 50, nullable: true })
  category: string; // avatar, document, firmware, report, etc.

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    thumbnail_url?: string;
    variants?: {
      small?: string;
      medium?: string;
      large?: string;
    };
  };

  @Column({ type: 'varchar', length: 64, nullable: true })
  checksum: string; // SHA256 for integrity

  @Column({ type: 'boolean', default: false })
  is_public: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
