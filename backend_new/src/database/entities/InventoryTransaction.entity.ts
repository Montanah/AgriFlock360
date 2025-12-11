// database/entities/InventoryTransaction.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { InventoryItem } from './InventoryItem.entity';
import { User } from './User.entity';

@Entity('inventory_transactions')
@Index('idx_inventory_transactions_item', ['inventory_item_id'])
@Index('idx_inventory_transactions_type', ['transaction_type'])
@Index('idx_inventory_transactions_date', ['transaction_date'])
@Index('idx_inventory_transactions_user', ['user_id'])
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  inventory_item_id: string;

  @ManyToOne(() => InventoryItem, (item) => item.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'inventory_item_id' })
  inventory_item: InventoryItem;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  transaction_type: string; // purchase, usage, adjustment, wastage, transfer, return

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity_before: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity_after: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost_per_unit: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_cost: number;

  @Column({ type: 'date' })
  transaction_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference_number: string; // Invoice number, PO number, etc.

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  batch_id: string; // Link to specific batch if usage

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    supplier?: string;
    invoice_url?: string;
    approved_by?: string;
  };

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
