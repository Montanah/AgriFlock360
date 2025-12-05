import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './User.entity';
import { Farm } from './Farm.entity';
import { BirdType } from './BirdType.entity';

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Basic Information
  @Column({ type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  national_id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 10, default: '+254' })
  calling_code: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'integer', nullable: true })
  age: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: Gender;

  @Column({ type: 'text', nullable: true })
  location: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string | null;

  // Farm/Poultry Information
  @Column({ type: 'uuid', nullable: true })
  farm_id: string;

  @ManyToOne(() => Farm, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'farm_id' })
  farm?: Farm;

  @Column({ type: 'integer', nullable: true })
  years_of_experience: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  poultry_type: BirdType;

  @Column({ type: 'integer', nullable: true })
  chicken_house_capacity: number;

  @Column({ type: 'integer', nullable: true })
  current_number_of_chickens: number;

  // Preferred Suppliers/Partners
  @Column({ type: 'varchar', length: 255, nullable: true })
  preferred_agrovet_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  preferred_feed_company: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  preferred_chicks_company: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  preferred_offtaker_agent: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
