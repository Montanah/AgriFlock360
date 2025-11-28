// roles/roles.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import type { QueryRunner } from 'typeorm';
import { Role } from '../database/entities/Role.entity';
import { Permission } from '../database/entities/Permission.entity';
import { CreateRoleDto, UpdateRoleDto, QueryRolesDto } from './dto/role.dto';
import { AssignPermissionsDto} from '../permissions/dto/permissions.dto';
import { PermissionsService } from '../permissions/permissions.service';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private permissionsService: PermissionsService,
    @Optional() private logger?: CustomLogger,
    @Optional() private queryRunner?: QueryRunner,
  ) {
    if (this.queryRunner) {
      this.roleRepository = this.queryRunner.manager.getRepository(Role);
      this.permissionRepository = this.queryRunner.manager.getRepository(Permission);
    }
  }

  async createRole(createDto: CreateRoleDto): Promise<Role> {
    // Check if role already exists
    const existingRole = await this.roleRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    // Get permissions if provided
    let permissions: Permission[] = [];
    if (createDto.permission_ids && createDto.permission_ids.length > 0) {
      permissions = await this.permissionsService.getPermissionsByIds(createDto.permission_ids);

      if (permissions.length !== createDto.permission_ids.length) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }
    }

    const role = this.roleRepository.create({
      name: createDto.name,
      description: createDto.description,
      permissions,
    });

    await this.roleRepository.save(role);

    if (this.logger) this.logger.log(`Role created: ${role.name} with ${permissions.length} permissions`);

    return this.getRole(role.id);
  }

  async getRoles(query: QueryRolesDto) {
    const { search, is_active, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.roleRepository
      .createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .loadRelationCountAndMap('role.usersCount', 'role.users')
      .skip(skip)
      .take(limit)
      .orderBy('role.created_at', 'DESC');

    if (search) {
      queryBuilder.andWhere(
        '(role.name ILIKE :search OR role.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (is_active !== undefined) {
      queryBuilder.andWhere('role.is_active = :is_active', { is_active });
    }

    const [roles, total] = await queryBuilder.getManyAndCount();

    return {
      roles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRole(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  async updateRole(id: string, updateDto: UpdateRoleDto): Promise<Role> {
    const role = await this.getRole(id);

    // Prevent updating system roles
    if (role.is_system_role) {
      throw new BadRequestException('Cannot update system role');
    }

    // Check if new name conflicts
    if (updateDto.name && updateDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    Object.assign(role, updateDto);
    await this.roleRepository.save(role);

    if (this.logger) this.logger.log(`Role updated: ${role.name}`);

    return this.getRole(id);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['users'],
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Prevent deleting system roles
    if (role.is_system_role) {
      throw new BadRequestException('Cannot delete system role');
    }

    // Check if role has users
    if (role.users && role.users.length > 0) {
      throw new BadRequestException(
        `Cannot delete role with ${role.users.length} assigned user(s). Reassign users first.`,
      );
    }

    await this.roleRepository.remove(role);

    if (this.logger) this.logger.log(`Role deleted: ${role.name}`);
  }

  async assignPermissions(roleId: string, assignDto: AssignPermissionsDto): Promise<Role> {
    const role = await this.getRole(roleId);

    // Prevent updating system roles
    if (role.is_system_role) {
      throw new BadRequestException('Cannot modify permissions of system role');
    }

    // Get all permissions
    const permissions = await this.permissionsService.getPermissionsByIds(
      assignDto.permission_ids,
    );

    if (permissions.length !== assignDto.permission_ids.length) {
      throw new BadRequestException('One or more permission IDs are invalid');
    }

    role.permissions = permissions;
    await this.roleRepository.save(role);

    if (this.logger) this.logger.log(
      `Permissions assigned to role ${role.name}: ${permissions.length} permissions`,
    );

    return this.getRole(roleId);
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.getRole(roleId);
    const permission = await this.permissionsService.getPermission(permissionId);

    // Check if permission already assigned
    const hasPermission = role.permissions.some(p => p.id === permissionId);

    if (hasPermission) {
      throw new BadRequestException('Permission already assigned to this role');
    }

    role.permissions.push(permission);
    await this.roleRepository.save(role);

    if (this.logger) this.logger.log(`Permission ${permission.name} added to role ${role.name}`);

    return this.getRole(roleId);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<Role> {
    const role = await this.getRole(roleId);

    // Prevent updating system roles
    if (role.is_system_role) {
      throw new BadRequestException('Cannot modify permissions of system role');
    }

    role.permissions = role.permissions.filter(p => p.id !== permissionId);
    await this.roleRepository.save(role);

    if (this.logger) this.logger.log(`Permission removed from role ${role.name}`);

    return this.getRole(roleId);
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    const role = await this.getRole(roleId);
    return role.permissions;
  }

  // Get permissions grouped by module
  async getRolePermissionsByModule(roleId: string): Promise<Record<string, Permission[]>> {
    const permissions = await this.getRolePermissions(roleId);

    const grouped: Record<string, Permission[]> = {};

    permissions.forEach(permission => {
      const module = permission.module || 'other';
      if (!grouped[module]) {
        grouped[module] = [];
      }
      grouped[module].push(permission);
    });

    return grouped;
  }

  // Check if role has specific permission
  async roleHasPermission(roleId: string, permissionName: string): Promise<boolean> {
    const role = await this.getRole(roleId);
    return role.permissions.some(p => p.name === permissionName);
  }

  // Seed default roles
  async seedDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'super_admin',
        description: 'Full system access - cannot be modified or deleted',
        is_system_role: true,
        permissions: ['system.admin'], // Will get ALL permissions
      },
      {
        name: 'admin',
        description: 'Administrator with most privileges',
        is_system_role: false,
        permissions: [
          'users.create', 'users.read', 'users.update', 'users.delete',
          'roles.create', 'roles.read', 'roles.update', 'roles.delete',
          'permissions.read',
          'devices.manage', 'flocks.manage', 'farms.manage',
          'reports.create', 'reports.read', 'reports.export',
        ],
      },
      {
        name: 'manager',
        description: 'Farm manager with operational access',
        is_system_role: false,
        permissions: [
          'users.read', 'devices.read', 'devices.update',
          'flocks.create', 'flocks.read', 'flocks.update', 'flocks.delete',
          'farms.read', 'farms.update',
          'reports.create', 'reports.read',
        ],
      },
      {
        name: 'viewer',
        description: 'Read-only access',
        is_system_role: false,
        permissions: [
          'users.read', 'devices.read', 'flocks.read', 'farms.read', 'reports.read',
        ],
      },
    ];

    for (const roleData of defaultRoles) {
      try {
        const existingRole = await this.getRoleByName(roleData.name);
        
        if (!existingRole) {
          const permissions = await this.permissionRepository.find({
            where: { name: In(roleData.permissions) },
          });

          // Super admin gets ALL permissions
          if (roleData.name === 'super_admin') {
            const allPermissions = await this.permissionRepository.find();
            await this.roleRepository.save(
              this.roleRepository.create({
                name: roleData.name,
                description: roleData.description,
                is_system_role: roleData.is_system_role,
                permissions: allPermissions,
              }),
            );
          } else {
            await this.roleRepository.save(
              this.roleRepository.create({
                name: roleData.name,
                description: roleData.description,
                is_system_role: roleData.is_system_role,
                permissions,
              }),
            );
          }

          if (this.logger) this.logger.log(`Default role created: ${roleData.name}`);
        }
      } catch (error) {
        if (this.logger) this.logger.error(`Failed to create role ${roleData.name}: ${error.message}`);
      }
    }
  }
}
