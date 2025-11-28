import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey, TableColumn } from 'typeorm';

export class CreateBatchsTable1736480000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create batchs table
    await queryRunner.createTable(
      new Table({
        name: 'batchs',
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
            isNullable: false,
          },
          {
            name: 'farm_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'device_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'breed',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'batch_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'bird_type',
            type: 'enum',
            enum: ['broiler', 'layer'],
            isNullable: false,
          },
          {
            name: 'current_count',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'initial_count',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'hatch_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'start_date',
            type: 'date',
            default: 'CURRENT_DATE',
            isNullable: false,
          },
          {
            name: 'expected_end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'actual_end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'current_status',
            type: 'enum',
            enum: ['active', 'completed', 'archived'],
            default: "'active'",
            isNullable: false,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'batchs',
      new TableIndex({
        name: 'idx_batchs_user',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'batchs',
      new TableIndex({
        name: 'idx_batchs_device',
        columnNames: ['device_id'],
      }),
    );

    await queryRunner.createIndex(
      'batchs',
      new TableIndex({
        name: 'idx_batchs_farm',
        columnNames: ['farm_id'],
      }),
    );

    await queryRunner.createIndex(
      'batchs',
      new TableIndex({
        name: 'idx_batchs_status',
        columnNames: ['current_status'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'batchs',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'batchs',
      new TableForeignKey({
        columnNames: ['farm_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'farms',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'batchs',
      new TableForeignKey({
        columnNames: ['device_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'devices',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('batchs');

    if (table) {
      // Drop foreign keys
      const foreignKeys = table.foreignKeys;
      for (const foreignKey of foreignKeys) {
        if (foreignKey.columnNames.includes('user_id') ||
            foreignKey.columnNames.includes('farm_id') ||
            foreignKey.columnNames.includes('device_id')) {
          await queryRunner.dropForeignKey('batchs', foreignKey);
        }
      }

      // Drop indexes
      const indexes = table.indices;
      await queryRunner.dropIndex('batchs', 'idx_batchs_status');
      await queryRunner.dropIndex('batchs', 'idx_batchs_farm');
      await queryRunner.dropIndex('batchs', 'idx_batchs_device');
      await queryRunner.dropIndex('batchs', 'idx_batchs_user');
    }

    // Drop table
    await queryRunner.dropTable('batchs');
  }
}
