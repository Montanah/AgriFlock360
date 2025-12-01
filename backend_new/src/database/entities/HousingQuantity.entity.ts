// database/entities/HousingQuantity.entity.ts
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
import { HousingMaterial } from './HousingMaterial.entity';

@Entity('housing_quantities')
@Index('idx_housing_quantities_material', ['material_id'])
@Index('idx_housing_quantities_capacity', ['bird_capacity'])
export class HousingQuantity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  material_id: string;

  @ManyToOne(() => HousingMaterial, material => material.quantities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'material_id' })
  material: HousingMaterial;

  @Column({ type: 'integer' })
  bird_capacity: number; // 100, 300, 500, 1000

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity_needed: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
