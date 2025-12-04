// database/entities/FieldAppraisal.entity.ts
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
import { ExtensionOfficer } from './ExtensionOfficer.entity';
import { User } from './User.entity';
import { Farm } from './Farm.entity';

@Entity('field_appraisals')
@Index('idx_field_appraisals_officer', ['officer_id'])
@Index('idx_field_appraisals_farmer', ['farmer_id'])
@Index('idx_field_appraisals_farm', ['farm_id'])
@Index('idx_field_appraisals_date', ['visit_date'])
@Index('idx_field_appraisals_status', ['status'])
export class FieldAppraisal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  officer_id: string;

  @ManyToOne(() => ExtensionOfficer, officer => officer.appraisals, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'officer_id' })
  officer: ExtensionOfficer;

  @Column({ type: 'uuid' })
  farmer_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmer_id' })
  farmer: User;

  @Column({ type: 'uuid', nullable: true })
  farm_id: string;

  @ManyToOne(() => Farm, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'farm_id' })
  farm: Farm;

  @Column({ type: 'timestamptz' })
  visit_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  visit_purpose: string; // inspection, consultation, follow_up, emergency

  // GPS Location
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location_name: string;

  // Structure Assessment (0-10 each)
  @Column({ type: 'integer', nullable: true })
  structure_integrity_score: number;

  @Column({ type: 'integer', nullable: true })
  ventilation_score: number;

  @Column({ type: 'integer', nullable: true })
  hygiene_score: number;

  @Column({ type: 'integer', nullable: true })
  biosecurity_score: number;

  @Column({ type: 'integer', nullable: true })
  feed_storage_score: number;

  @Column({ type: 'integer', nullable: true })
  water_reliability_score: number;

  // Equipment Verification
  @Column({ type: 'boolean', default: false })
  brooder_verified: boolean;

  @Column({ type: 'text', nullable: true })
  brooder_condition: string;

  @Column({ type: 'boolean', default: false })
  feeders_verified: boolean;

  @Column({ type: 'text', nullable: true })
  feeders_condition: string;

  @Column({ type: 'boolean', default: false })
  drinkers_verified: boolean;

  @Column({ type: 'text', nullable: true })
  drinkers_condition: string;

  // Farmer Assessment
  @Column({ type: 'integer', nullable: true })
  farmer_knowledge_score: number; // 0-10

  @Column({ type: 'text', nullable: true })
  farmer_knowledge_notes: string;

  // Buyer Verification
  @Column({ type: 'boolean', default: false })
  buyer_verified: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  buyer_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  buyer_contact: string;

  // Fraud Flags
  @Column({ type: 'boolean', default: false })
  fraud_flag_raised: boolean;

  @Column({ type: 'jsonb', nullable: true })
  fraud_indicators: {
    suspicious_activities?: string[];
    red_flags?: string[];
    severity?: string; // low, medium, high, critical
  };

  // Photos
  @Column({ type: 'jsonb', nullable: true })
  photos: {
    house_exterior?: string[];
    house_interior?: string[];
    brooder?: string[];
    feeders?: string[];
    drinkers?: string[];
    water_source?: string[];
    feed_store?: string[];
    risks_identified?: string[];
    general?: string[];
  };

  // Overall Score & Recommendation
  @Column({ type: 'integer', default: 0 })
  overall_score: number; // 0-100

  @Column({ type: 'text' })
  recommendation: string;

  @Column({ type: 'text', nullable: true })
  observations: string;

  @Column({ type: 'text', nullable: true })
  action_items: string;

  @Column({ type: 'date', nullable: true })
  follow_up_date: Date;

  @Column({ type: 'varchar', length: 50, default: 'completed' })
  status: string; // pending, in_progress, completed, requires_follow_up

  @Column({ type: 'jsonb', nullable: true })
  checklist: {
    items_checked?: string[];
    items_failed?: string[];
    improvements_needed?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  recommendations_given: {
    immediate?: string[];
    short_term?: string[];
    long_term?: string[];
  };

  // Farmer Feedback
  @Column({ type: 'integer', nullable: true })
  farmer_rating: number; // 1-5 rating of officer

  @Column({ type: 'text', nullable: true })
  farmer_feedback: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    weather_conditions?: string;
    time_spent_minutes?: number;
    previous_visit_id?: string;
  };

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}