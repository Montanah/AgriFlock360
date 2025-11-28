// database/entities/VaccineCatalog.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Vaccination } from './Vaccination.entity';

@Entity('vaccine_catalog')
@Index('idx_vaccine_catalog_name', ['vaccine_name'])
@Index('idx_vaccine_catalog_type', ['vaccine_type'])
@Index('idx_vaccine_catalog_active', ['is_active'])
export class VaccineCatalog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  vaccine_name: string;

  @Column({ type: 'varchar', length: 100 })
  vaccine_type: string; // viral, bacterial, protozoan, etc.

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  manufacturer: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand_name: string;

  // Recommended age in days (can be a range)
  @Column({ type: 'integer', nullable: true })
  recommended_age_min: number; // e.g., 1 day

  @Column({ type: 'integer', nullable: true })
  recommended_age_max: number; // e.g., 7 days

  @Column({ type: 'text', nullable: true })
  recommended_age_description: string; // e.g., "Day 1-7", "Week 2-3"

  @Column({ type: 'varchar', length: 100 })
  dosage: string; // e.g., "0.03ml per bird", "1 drop per bird"

  @Column({ type: 'varchar', length: 100 })
  administration_method: string; // injection, drinking water, eye drop, spray, feed

  @Column({ type: 'text', nullable: true })
  usage_instructions: string;

  @Column({ type: 'text', nullable: true })
  precautions: string;

  @Column({ type: 'text', nullable: true })
  side_effects: string;

  @Column({ type: 'integer', nullable: true })
  withdrawal_period_days: number; // Days before slaughter/egg consumption

  @Column({ type: 'varchar', length: 100, nullable: true })
  storage_conditions: string; // e.g., "2-8°C", "Room temperature"

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimated_cost_per_dose: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currency: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  target_disease: string; // e.g., "Newcastle Disease", "Marek's Disease"

  @Column({ type: 'varchar', length: 100, nullable: true })
  bird_type: string; // layers, broilers, all

  @Column({ type: 'boolean', default: true })
  is_recommended: boolean; // Featured/recommended by admin

  @Column({ type: 'boolean', default: true })
  is_active: boolean; // Can be used/shown

  @Column({ type: 'integer', default: 0 })
  usage_count: number; // Track how many times this vaccine has been used

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    keywords?: string[];
    links?: string[];
    documents?: string[];
  };

  @OneToMany(() => Vaccination, vaccination => vaccination.vaccine_catalog)
  vaccinations: Vaccination[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
