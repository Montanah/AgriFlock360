// permissions/permissions.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import type { QueryRunner } from 'typeorm';
import { Permission } from '../database/entities/Permission.entity';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  QueryPermissionsDto,
} from './dto/permissions.dto';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @Optional() private logger?: CustomLogger,
    @Optional() private queryRunner?: QueryRunner,
  ) {
    if (this.queryRunner) {
      this.permissionRepository =
        this.queryRunner.manager.getRepository(Permission);
    }
  }

  async createPermission(createDto: CreatePermissionDto): Promise<Permission> {
    // Check if permission already exists
    const existingPermission = await this.permissionRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingPermission) {
      throw new ConflictException('Permission with this name already exists');
    }

    const permission = this.permissionRepository.create(createDto);
    await this.permissionRepository.save(permission);

    if (this.logger) this.logger.log(`Permission created: ${permission.name}`);

    return permission;
  }

  async createBulkPermissions(
    permissions: CreatePermissionDto[],
  ): Promise<Permission[]> {
    const createdPermissions: Permission[] = [];

    for (const permDto of permissions) {
      try {
        const permission = await this.createPermission(permDto);
        createdPermissions.push(permission);
      } catch (error) {
        if (error instanceof ConflictException) {
          if (this.logger)
            this.logger.warn(`Permission already exists: ${permDto.name}`);
        } else {
          throw error;
        }
      }
    }

    return createdPermissions;
  }

  async getPermissions(query: QueryPermissionsDto) {
    const { module, action, search, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.permissionRepository
      .createQueryBuilder('permission')
      .skip(skip)
      .take(limit)
      .orderBy('permission.module', 'ASC')
      .addOrderBy('permission.action', 'ASC');

    if (module) {
      queryBuilder.andWhere('permission.module = :module', { module });
    }

    if (action) {
      queryBuilder.andWhere('permission.action = :action', { action });
    }

    if (search) {
      queryBuilder.andWhere(
        '(permission.name ILIKE :search OR permission.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [permissions, total] = await queryBuilder.getManyAndCount();

    return {
      permissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPermission(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
      relations: ['roles'],
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  async getPermissionByName(name: string): Promise<Permission | null> {
    return this.permissionRepository.findOne({ where: { name } });
  }

  async updatePermission(
    id: string,
    updateDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.getPermission(id);

    // Check if new name conflicts
    if (updateDto.name && updateDto.name !== permission.name) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: updateDto.name },
      });

      if (existingPermission) {
        throw new ConflictException('Permission with this name already exists');
      }
    }

    Object.assign(permission, updateDto);
    await this.permissionRepository.save(permission);

    if (this.logger) this.logger.log(`Permission updated: ${permission.name}`);

    return permission;
  }

  async deletePermission(id: string): Promise<void> {
    const permission = await this.getPermission(id);

    await this.permissionRepository.remove(permission);

    if (this.logger) this.logger.log(`Permission deleted: ${permission.name}`);
  }

  async getPermissionsByIds(ids: string[]): Promise<Permission[]> {
    if (!ids || ids.length === 0) {
      return [];
    }

    return this.permissionRepository.findByIds(ids);
  }

  async getModules(): Promise<string[]> {
    const result = await this.permissionRepository
      .createQueryBuilder('permission')
      .select('DISTINCT permission.module', 'module')
      .where('permission.module IS NOT NULL')
      .orderBy('permission.module', 'ASC')
      .getRawMany();

    return result.map((r) => r.module);
  }

  async getPermissionsByModule(module: string): Promise<Permission[]> {
    return this.permissionRepository.find({
      where: { module },
      order: { action: 'ASC' },
    });
  }

  // Helper method to check if a user has a specific permission
  async userHasPermission(
    userId: string,
    permissionName: string,
  ): Promise<boolean> {
    const permission = await this.permissionRepository
      .createQueryBuilder('permission')
      .leftJoinAndSelect('permission.roles', 'role')
      .leftJoinAndSelect('role.users', 'user')
      .where('permission.name = :permissionName', { permissionName })
      .andWhere('user.id = :userId', { userId })
      .getOne();

    return !!permission;
  }

  // Seed default permissions
  async seedDefaultPermissions(): Promise<void> {
    const defaultPermissions = this.getDefaultPermissions();
    await this.createBulkPermissions(defaultPermissions);
    if (this.logger) this.logger.log('Default permissions seeded');
  }

  private getDefaultPermissions(): CreatePermissionDto[] {
    const modules = [
      'users',
      'roles',
      'permissions',
      'devices',
      'batchs',
      'farms',
      'reports',
      'uploads',
    ];
    const actions = ['create', 'read', 'update', 'delete', 'manage'];

    const permissions: CreatePermissionDto[] = [];

    // Generate CRUD permissions for each module
    modules.forEach((module) => {
      actions.forEach((action) => {
        permissions.push({
          name: `${module}.${action}`,
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module}`,
          module,
          action,
        });
      });
    });

    // Add special permissions
    permissions.push(
      {
        name: 'system.admin',
        description: 'Full system administration access',
        module: 'system',
        action: 'admin',
      },
      {
        name: 'reports.export',
        description: 'Export reports',
        module: 'reports',
        action: 'export',
      },
      {
        name: 'users.impersonate',
        description: 'Impersonate other users',
        module: 'users',
        action: 'impersonate',
      },
    );

    return permissions;
  }
}
