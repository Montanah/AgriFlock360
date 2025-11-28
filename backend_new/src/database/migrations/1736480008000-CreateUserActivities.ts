// migrations/XXXXXX-create-user-activities.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUserActivities1736480008000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_activities',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'activity_type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'inet',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'device_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'user_activities',
      new TableIndex({
        name: 'idx_user_activities_user',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'user_activities',
      new TableIndex({
        name: 'idx_user_activities_type',
        columnNames: ['activity_type'],
      }),
    );

    await queryRunner.createIndex(
      'user_activities',
      new TableIndex({
        name: 'idx_user_activities_created',
        columnNames: ['created_at'],
      }),
    );

    await queryRunner.createForeignKey(
      'user_activities',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('user_activities');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        fk => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('user_activities', foreignKey);
      }
    }
    await queryRunner.dropIndex('user_activities', 'idx_user_activities_created');
    await queryRunner.dropIndex('user_activities', 'idx_user_activities_type');
    await queryRunner.dropIndex('user_activities', 'idx_user_activities_user');
    await queryRunner.dropTable('user_activities');
  }
}