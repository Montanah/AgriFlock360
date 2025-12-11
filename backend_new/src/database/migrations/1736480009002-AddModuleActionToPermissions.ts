// migrations/XXXXXX-add-module-action-to-permissions.ts
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddModuleActionToPermissions1736480009002
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'permissions',
      new TableColumn({
        name: 'module',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'permissions',
      new TableColumn({
        name: 'action',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    // Add indexes for better query performance
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_permissions_action ON permissions(action);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_permissions_action;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_permissions_module;`);
    await queryRunner.dropColumn('permissions', 'action');
    await queryRunner.dropColumn('permissions', 'module');
  }
}
