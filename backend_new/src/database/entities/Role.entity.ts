import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';

import { User } from './User.entity';
import { Permission } from './Permission.entity';

@Entity('roles')
@Index('idx_roles_created_at', ['created_at'])
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  is_system_role: boolean; // Cannot be deleted if true (e.g., super_admin)

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => User, user => user.role)
  users: User[];

  @ManyToMany(() => Permission, permission => permission.roles, {
    cascade: true,
  })
  
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
