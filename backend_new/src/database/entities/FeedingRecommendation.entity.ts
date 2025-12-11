// database/entities/FeedingRecommendation.entity.ts
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
import { BirdType } from './BirdType.entity';

@Entity('feeding_recommendations')
@Index('idx_feeding_rec_bird_type', ['bird_type_id'])
@Index('idx_feeding_rec_age', ['age_start', 'age_end'])
export class FeedingRecommendation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  bird_type_id: string;

  @ManyToOne(() => BirdType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bird_type_id' })
  bird_type: BirdType;

  @Column({ type: 'varchar', length: 100 })
  stage_name: string; // Starter, Grower, Finisher, Layer

  @Column({ type: 'integer' })
  age_start: number; // Days

  @Column({ type: 'integer' })
  age_end: number; // Days

  @Column({ type: 'varchar', length: 100 })
  feed_type: string; // Starter mash, Grower mash, Finisher mash, Layer mash

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  protein_percentage: number; // e.g., 22.00 for 22%

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantity_per_bird_per_day: number; // kg per bird per day

  @Column({ type: 'integer', default: 2 })
  times_per_day: number; // How many times to feed

  @Column({ type: 'jsonb', nullable: true })
  feeding_times: {
    slots: string[]; // ['06:00', '12:00', '18:00']
  };

  @Column({ type: 'text', nullable: true })
  notes: string; // Special instructions

  @Column({ type: 'text', nullable: true })
  supplements: string; // e.g., "Add calcium for layers"

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_system_default: boolean; // Cannot be deleted

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    energy_level?: string;
    fiber_percentage?: number;
    calcium_percentage?: number;
    special_requirements?: string[];
  };

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
