// database/seeders/rbac-seeder.ts
import { QueryRunner, In } from 'typeorm';
import { dataSource } from '../data-source';
import { Permission } from '../entities/Permission.entity';
import { Role } from '../entities/Role.entity';

// Permission Seeding
async function seedPermissions(queryRunner: QueryRunner): Promise<void> {
  const permissionRepository = queryRunner.manager.getRepository(Permission);

  const defaultPermissions = [
    // Users module
    {
      name: 'users.create',
      description: 'Create users',
      module: 'users',
      action: 'create',
    },
    {
      name: 'users.read',
      description: 'Read users',
      module: 'users',
      action: 'read',
    },
    {
      name: 'users.update',
      description: 'Update users',
      module: 'users',
      action: 'update',
    },
    {
      name: 'users.delete',
      description: 'Delete users',
      module: 'users',
      action: 'delete',
    },
    {
      name: 'users.manage',
      description: 'Manage users',
      module: 'users',
      action: 'manage',
    },
    // Roles module
    {
      name: 'roles.create',
      description: 'Create roles',
      module: 'roles',
      action: 'create',
    },
    {
      name: 'roles.read',
      description: 'Read roles',
      module: 'roles',
      action: 'read',
    },
    {
      name: 'roles.update',
      description: 'Update roles',
      module: 'roles',
      action: 'update',
    },
    {
      name: 'roles.delete',
      description: 'Delete roles',
      module: 'roles',
      action: 'delete',
    },
    {
      name: 'roles.manage',
      description: 'Manage roles',
      module: 'roles',
      action: 'manage',
    },
    // Permissions module
    {
      name: 'permissions.create',
      description: 'Create permissions',
      module: 'permissions',
      action: 'create',
    },
    {
      name: 'permissions.read',
      description: 'Read permissions',
      module: 'permissions',
      action: 'read',
    },
    {
      name: 'permissions.update',
      description: 'Update permissions',
      module: 'permissions',
      action: 'update',
    },
    {
      name: 'permissions.delete',
      description: 'Delete permissions',
      module: 'permissions',
      action: 'delete',
    },
    {
      name: 'permissions.manage',
      description: 'Manage permissions',
      module: 'permissions',
      action: 'manage',
    },
    // Devices module
    {
      name: 'devices.create',
      description: 'Create devices',
      module: 'devices',
      action: 'create',
    },
    {
      name: 'devices.read',
      description: 'Read devices',
      module: 'devices',
      action: 'read',
    },
    {
      name: 'devices.update',
      description: 'Update devices',
      module: 'devices',
      action: 'update',
    },
    {
      name: 'devices.delete',
      description: 'Delete devices',
      module: 'devices',
      action: 'delete',
    },
    {
      name: 'devices.manage',
      description: 'Manage devices',
      module: 'devices',
      action: 'manage',
    },
    // Flocks module
    {
      name: 'flocks.create',
      description: 'Create flocks',
      module: 'flocks',
      action: 'create',
    },
    {
      name: 'flocks.read',
      description: 'Read flocks',
      module: 'flocks',
      action: 'read',
    },
    {
      name: 'flocks.update',
      description: 'Update flocks',
      module: 'flocks',
      action: 'update',
    },
    {
      name: 'flocks.delete',
      description: 'Delete flocks',
      module: 'flocks',
      action: 'delete',
    },
    {
      name: 'flocks.manage',
      description: 'Manage flocks',
      module: 'flocks',
      action: 'manage',
    },
    // Farms module
    {
      name: 'farms.create',
      description: 'Create farms',
      module: 'farms',
      action: 'create',
    },
    {
      name: 'farms.read',
      description: 'Read farms',
      module: 'farms',
      action: 'read',
    },
    {
      name: 'farms.update',
      description: 'Update farms',
      module: 'farms',
      action: 'update',
    },
    {
      name: 'farms.delete',
      description: 'Delete farms',
      module: 'farms',
      action: 'delete',
    },
    {
      name: 'farms.manage',
      description: 'Manage farms',
      module: 'farms',
      action: 'manage',
    },
    // Reports module
    {
      name: 'reports.create',
      description: 'Create reports',
      module: 'reports',
      action: 'create',
    },
    {
      name: 'reports.read',
      description: 'Read reports',
      module: 'reports',
      action: 'read',
    },
    {
      name: 'reports.update',
      description: 'Update reports',
      module: 'reports',
      action: 'update',
    },
    {
      name: 'reports.delete',
      description: 'Delete reports',
      module: 'reports',
      action: 'delete',
    },
    {
      name: 'reports.export',
      description: 'Export reports',
      module: 'reports',
      action: 'export',
    },
    {
      name: 'reports.manage',
      description: 'Manage reports',
      module: 'reports',
      action: 'manage',
    },
    // Uploads module
    {
      name: 'uploads.create',
      description: 'Create uploads',
      module: 'uploads',
      action: 'create',
    },
    {
      name: 'uploads.read',
      description: 'Read uploads',
      module: 'uploads',
      action: 'read',
    },
    {
      name: 'uploads.update',
      description: 'Update uploads',
      module: 'uploads',
      action: 'update',
    },
    {
      name: 'uploads.delete',
      description: 'Delete uploads',
      module: 'uploads',
      action: 'delete',
    },
    {
      name: 'uploads.manage',
      description: 'Manage uploads',
      module: 'uploads',
      action: 'manage',
    },
    // System module
    {
      name: 'system.admin',
      description: 'Full system administration access',
      module: 'system',
      action: 'admin',
    },
    // Special permissions
    {
      name: 'users.impersonate',
      description: 'Impersonate other users',
      module: 'users',
      action: 'impersonate',
    },
  ];

  for (const perm of defaultPermissions) {
    const existingPermission = await permissionRepository.findOne({
      where: { name: perm.name },
    });
    if (!existingPermission) {
      const newPerm = permissionRepository.create(perm);
      await permissionRepository.save(newPerm);
      console.log(`✅ Created permission: ${perm.name}`);
    } else {
      console.log(`⚠️ Permission already exists: ${perm.name}`);
    }
  }
}

// Role Seeding
async function seedRoles(queryRunner: QueryRunner): Promise<void> {
  const roleRepository = queryRunner.manager.getRepository(Role);
  const permissionRepository = queryRunner.manager.getRepository(Permission);

  const defaultRoles = [
    {
      name: 'super_admin',
      description: 'Full system access - cannot be modified or deleted',
      is_system_role: true,
      permissions: ['system.admin'], // Will get ALL permissions later
    },
    {
      name: 'admin',
      description: 'Administrator with most privileges',
      is_system_role: false,
      permissions: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'roles.create',
        'roles.read',
        'roles.update',
        'roles.delete',
        'permissions.read',
        'devices.manage',
        'flocks.manage',
        'farms.manage',
        'reports.create',
        'reports.read',
        'reports.export',
      ],
    },
    {
      name: 'manager',
      description: 'Farm manager with operational access',
      is_system_role: false,
      permissions: [
        'users.read',
        'devices.read',
        'devices.update',
        'flocks.create',
        'flocks.read',
        'flocks.update',
        'flocks.delete',
        'farms.read',
        'farms.update',
        'reports.create',
        'reports.read',
      ],
    },
    {
      name: 'viewer',
      description: 'Read-only access',
      is_system_role: false,
      permissions: [
        'users.read',
        'devices.read',
        'flocks.read',
        'farms.read',
        'reports.read',
      ],
    },
  ];

  for (const roleData of defaultRoles) {
    const existingRoleCount = await queryRunner.manager.query(
      'SELECT COUNT(*) FROM roles WHERE name = $1',
      [roleData.name],
    );
    if (existingRoleCount[0].count === '0') {
      const permissions = await permissionRepository.find({
        where: { name: In(roleData.permissions) },
      });

      // Super admin gets ALL permissions
      let allPermissions = permissions;
      if (roleData.name === 'super_admin') {
        allPermissions = await permissionRepository.find();
      }

      // Insert using raw SQL to avoid column issues
      const result = await queryRunner.manager.query(
        `INSERT INTO roles (id, name, description, created_at, updated_at) VALUES (gen_random_uuid(), $1, $2, NOW(), NOW()) RETURNING id`,
        [roleData.name, roleData.description],
      );

      const roleId = result[0].id;

      // Insert into role_permissions junction table
      for (const perm of allPermissions) {
        await queryRunner.manager.query(
          `INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)`,
          [roleId, perm.id],
        );
      }
      console.log(`✅ Created role: ${roleData.name}`);
    } else {
      console.log(`⚠️ Role already exists: ${roleData.name}`);
    }
  }
}

async function bootstrap() {
  console.log('🌱 Starting RBAC database seeding...');

  try {
    // Initialize data source
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log('✅ Data source initialized');
    }

    // Start transaction
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log('🌱 Seeding permissions...');
      await seedPermissions(queryRunner);
      console.log('✅ Permissions seeded successfully');

      console.log('🌱 Seeding roles...');
      await seedRoles(queryRunner);
      console.log('✅ Roles seeded successfully');

      console.log('🎉 RBAC seeding completed!');

      // Commit transaction
      await queryRunner.commitTransaction();
      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      console.error('❌ Seeding failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

bootstrap();
