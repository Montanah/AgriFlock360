// database/entities/ExtensionOfficer.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { FieldAppraisal } from './FieldAppraisal.entity';

@Entity('extension_officers')
@Index('idx_extension_officers_type', ['officer_type'])
@Index('idx_extension_officers_region', ['region'])
@Index('idx_extension_officers_status', ['status'])
export class ExtensionOfficer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  officer_type: string; // vet, field_officer, extension_worker

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  region: string; // County, region, or area of operation

  @Column({ type: 'integer', nullable: true })
  age: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string; // male, female, other, prefer_not_to_say

  @Column({ type: 'integer', nullable: true })
  years_of_experience: number;

  @Column({ type: 'text', nullable: true })
  profile_bio: string; // 100 characters for profile

  @Column({ type: 'text', nullable: true })
  id_photo_url: string; // ID card/official identification

  @Column({ type: 'text', nullable: true })
  face_selfie_url: string; // Face verification photo

  @Column({ type: 'text', nullable: true })
  certificate_url: string; // Primary certificate

  @Column({ type: 'text', nullable: true })
  additional_certificate_url: string; // Additional certificates/qualifications

  @Column({ type: 'varchar', length: 255, nullable: true })
  license_number: string; // Professional license/registration number

  @Column({ type: 'date', nullable: true })
  license_expiry_date: Date;

  @Column({ type: 'varchar', length: 50, default: 'active' })
  status: string; // active, inactive, suspended, pending_verification

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'date', nullable: true })
  verified_at: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  verified_by: string;

  @Column({ type: 'jsonb', nullable: true })
  specializations: {
    areas?: string[]; // poultry_health, nutrition, biosecurity, etc.
    certifications?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  coverage_areas: {
    counties?: string[];
    sub_counties?: string[];
    wards?: string[];
  };

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  average_rating: number;

  @Column({ type: 'integer', default: 0 })
  total_appraisals: number;

  @Column({ type: 'jsonb', nullable: true })
  contact_info: {
    alternative_phone?: string;
    whatsapp?: string;
    emergency_contact?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    employer?: string;
    organization?: string;
    employee_id?: string;
  };

  @OneToMany(() => FieldAppraisal, (appraisal) => appraisal.officer)
  appraisals: FieldAppraisal[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
