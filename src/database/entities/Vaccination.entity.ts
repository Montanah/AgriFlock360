import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Flock } from './Flock.entity';

export type VaccinationStatus = 'scheduled' | 'completed' | 'missed';

@Entity('vaccinations')
@Index('idx_vaccinations_flock', ['flock_id'])
@Index('idx_vaccinations_status', ['vaccination_status'])
@Index('idx_vaccinations_scheduled', ['scheduled_date'])
export class Vaccination {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  flock_id: string;

  @ManyToOne(() => Flock, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flock_id' })
  flock: Flock;

  @Column({ type: 'varchar', length: 255 })
  vaccine_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vaccine_type?: string; // e.g., 'Newcastle', 'Gumboro'

  @Column({ type: 'date' })
  scheduled_date: string;

  @Column({ type: 'date', nullable: true })
  completed_date?: string;

  @Column({
    type: 'varchar',
    default: 'scheduled',
  })
  vaccination_status: VaccinationStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  dosage?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  administered_by?: string;

  @Column({ type: 'integer', nullable: true })
  birds_vaccinated?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'boolean', default: false })
  reminder_sent: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
