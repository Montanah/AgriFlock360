// database/entities/HousingMaterial.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { HousingQuantity } from './HousingQuantity.entity';

@Entity('housing_materials')
@Index('idx_housing_materials_name', ['name'])
@Index('idx_housing_materials_category', ['category'])
export class HousingMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string; // roofing, walls, fencing, fixtures, construction, labor

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  unit: string; // pcs, kg, ft, tones, rolls, pc

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'varchar', length: 50, default: 'KES' })
  currency: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier: string;

  @Column({ type: 'text', nullable: true })
  specifications: string; // e.g., "32 gauge 10ft"

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_system_default: boolean;

  @Column({ type: 'integer', default: 0 })
  display_order: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    alternatives?: string[];
    notes?: string[];
    image_url?: string;
  };

  @OneToMany(() => HousingQuantity, quantity => quantity.material)
  quantities: HousingQuantity[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}