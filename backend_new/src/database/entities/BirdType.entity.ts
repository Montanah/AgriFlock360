// database/entities/BirdType.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Batch } from './Batch.entity';
import { FeedingRecommendation } from './FeedingRecommendation.entity';

@Entity('bird_types')
export class BirdType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string; // broiler, layer, kienyeji, duck, turkey

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => Batch, (batch) => batch.bird_type)
  batches: Batch[];

  @OneToMany(() => FeedingRecommendation, (rec) => rec.bird_type)
  feeding_recommendations: FeedingRecommendation[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
