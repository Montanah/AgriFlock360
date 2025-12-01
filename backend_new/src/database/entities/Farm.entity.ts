// entities/farm.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './User.entity';
import { Batch } from './Batch.entity';

@Entity('farms')
@Index('idx_farms_user', ['user_id'])
export class Farm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  farm_name: string;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'jsonb', nullable: true })
  gps_coordinates: {
    latitude?: number;
    longitude?: number;
  };

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  total_area: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  farm_type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  contact_info: {
    phone?: string;
    email?: string;
    address?: string;
  };

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => Batch, (batch) => batch.farm)
  batchs: Batch[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}

