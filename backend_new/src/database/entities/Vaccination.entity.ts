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
import { Batch } from './Batch.entity';
import { VaccineCatalog } from './VaccineCatalog.entity';

@Entity('vaccinations')
@Index('idx_vaccinations_batch', ['batch_id'])
@Index('idx_vaccinations_status', ['vaccination_status'])
@Index('idx_vaccinations_scheduled', ['scheduled_date'])
@Index('idx_vaccinations_vaccine_catalog', ['vaccine_catalog_id'])
export class Vaccination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** RELATION: Batch */
  @Column({ type: 'uuid' })
  batch_id: string;

  @ManyToOne(() => Batch, (batch) => batch.vaccinations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'batch_id' })
  batch: Batch;

  /** RELATION: Vaccine Catalog (Optional) */
  @Column({ type: 'uuid', nullable: true })
  vaccine_catalog_id: string;

  @ManyToOne(() => VaccineCatalog, (catalog) => catalog.vaccinations, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'vaccine_catalog_id' })
  vaccine_catalog: VaccineCatalog;

  /** Manual entry fields */
  @Column({ type: 'varchar', length: 255 })
  vaccine_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vaccine_type: string;

  /** Dates */
  @Column({ type: 'date' })
  scheduled_date: Date;

  @Column({ type: 'date', nullable: true })
  completed_date: Date;

  /** Vaccination status */
  @Column({
    type: 'varchar',
    length: 20,
    default: 'scheduled',
  })
  vaccination_status: string; // scheduled | completed | missed | cancelled

  /** Additional details */
  @Column({ type: 'varchar', length: 100, nullable: true })
  dosage: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  administration_method: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  administered_by: string;

  @Column({ type: 'int', nullable: true })
  birds_vaccinated: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  /** Notification system */
  @Column({ type: 'boolean', default: false })
  reminder_sent: boolean;

  /** Source of vaccine info */
  @Column({
    type: 'varchar',
    length: 50,
    default: 'catalog',
  })
  source: string; // catalog | manual

  /** Audit Fields */
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
