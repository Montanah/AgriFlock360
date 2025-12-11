// database/entities/InventoryItem.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';
import { Farm } from './Farm.entity';
import { InventoryCategory } from './InventoryCategory.entity';
import { InventoryTransaction } from './InventoryTransaction.entity';

@Entity('inventory_items')
@Index('idx_inventory_items_user', ['user_id'])
@Index('idx_inventory_items_farm', ['farm_id'])
@Index('idx_inventory_items_category', ['category_id'])
@Index('idx_inventory_items_name', ['item_name'])
@Index('idx_inventory_items_stock', ['current_stock'])
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', nullable: true })
  farm_id: string;

  @ManyToOne(() => Farm, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'farm_id' })
  farm: Farm;

  @Column({ type: 'uuid' })
  category_id: string;

  @ManyToOne(() => InventoryCategory, (category) => category.items, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: InventoryCategory;

  @Column({ type: 'varchar', length: 255 })
  item_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  item_code: string; // SKU or internal code

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  unit_of_measurement: string; // kg, liters, pieces, bags, etc.

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  current_stock: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimum_stock_level: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  reorder_point: number; // Auto-reorder at this level

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost_per_unit: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier_contact: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  storage_location: string; // Warehouse A, Room 2, etc.

  @Column({ type: 'date', nullable: true })
  last_restock_date: Date;

  @Column({ type: 'date', nullable: true })
  expiry_date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 50, default: 'in_stock' })
  status: string; // in_stock, low_stock, out_of_stock, discontinued

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    batch_number?: string;
    manufacturer?: string;
    barcode?: string;
    images?: string[];
  };

  @OneToMany(
    () => InventoryTransaction,
    (transaction) => transaction.inventory_item,
  )
  transactions: InventoryTransaction[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
