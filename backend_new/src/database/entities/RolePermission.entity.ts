// database/entities/RolePermission.entity.ts (Junction table - auto-created by TypeORM but can be explicit)
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Role } from './Role.entity';
import { Permission } from './Permission.entity';

@Entity('role_permissions')
@Index('idx_role_permissions_role', ['role_id'])
@Index('idx_role_permissions_permission', ['permission_id'])
@Index('idx_role_permissions_unique', ['role_id', 'permission_id'], {
  unique: true,
})
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'uuid' })
  permission_id: string;

  @ManyToOne(() => Permission, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
}
