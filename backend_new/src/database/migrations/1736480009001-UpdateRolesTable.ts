
// migrations/XXXXXX-update-roles-table.ts
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateRolesTable1736480009001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add is_system_role column
    await queryRunner.addColumn(
      'roles',
      new TableColumn({
        name: 'is_system_role',
        type: 'boolean',
        default: false,
      }),
    );

    // Add is_active column
    await queryRunner.addColumn(
      'roles',
      new TableColumn({
        name: 'is_active',
        type: 'boolean',
        default: true,
      }),
    );

    // Add created_at and updated_at if they don't exist
    const table = await queryRunner.getTable('roles');
    const hasCreatedAt = table?.columns.find(col => col.name === 'created_at');
    const hasUpdatedAt = table?.columns.find(col => col.name === 'updated_at');

    if (!hasCreatedAt) {
      await queryRunner.addColumn(
        'roles',
        new TableColumn({
          name: 'created_at',
          type: 'timestamptz',
          default: 'CURRENT_TIMESTAMP',
        }),
      );
    }

    if (!hasUpdatedAt) {
      await queryRunner.addColumn(
        'roles',
        new TableColumn({
          name: 'updated_at',
          type: 'timestamptz',
          default: 'CURRENT_TIMESTAMP',
        }),
      );
    }

    // Add index
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_roles_created_at ON roles(created_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_roles_created_at;`);
    await queryRunner.dropColumn('roles', 'is_active');
    await queryRunner.dropColumn('roles', 'is_system_role');
  }
}

