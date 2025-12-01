
// database/entities/HousingQuotation.entity.ts
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

@Entity('housing_quotations')
@Index('idx_housing_quotations_user', ['user_id'])
@Index('idx_housing_quotations_capacity', ['bird_capacity'])
@Index('idx_housing_quotations_date', ['created_at'])
export class HousingQuotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'integer' })
  bird_capacity: number;

  @Column({ type: 'jsonb' })
  materials: Array<{
    material_id: string;
    material_name: string;
    category: string;
    unit: string;
    unit_price: number;
    quantity: number;
    total_cost: number;
    specifications?: string;
  }>;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  materials_subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 26.0 })
  labor_percentage: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  labor_cost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  grand_total: number;

  @Column({ type: 'varchar', length: 50, default: 'KES' })
  currency: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status: string; // draft, approved, rejected, completed

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    location?: string;
    project_name?: string;
    contractor?: string;
  };

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}