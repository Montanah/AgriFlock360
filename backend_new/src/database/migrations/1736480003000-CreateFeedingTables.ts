import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';
undefined

export class CreateFeedingTables1736480003000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create feeding_schedules table
    if (!(await queryRunner.hasTable('feeding_schedules'))) {
      await queryRunner.createTable(
      new Table({
        name: 'feeding_schedules',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'batch_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'feed_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'quantity_per_day',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'times_per_day',
            type: 'integer',
            default: 2,
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
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
    }

    // Create feeding_records table
    if (!(await queryRunner.hasTable('feeding_records'))) {
      await queryRunner.createTable(
      new Table({
        name: 'feeding_records',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'batch_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'schedule_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'feed_type',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'fed_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'recorded_by',
            type: 'uuid',
            isNullable: true,
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
        ],
      }),
      true,
    );
    }

    // Create indexes for feeding_schedules
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_feeding_batch ON feeding_schedules(batch_id);
    `);

    // Create indexes for feeding_records
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_feeding_records_batch ON feeding_records(batch_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_feeding_records_date ON feeding_records(fed_at);
    `);

    // Create foreign keys for feeding_schedules
    try {
      await queryRunner.createForeignKey(
        'feeding_schedules',
        new TableForeignKey({
          columnNames: ['batch_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'batchs',
          onDelete: 'CASCADE',
        }),
      );
    } catch (error) {
      // Foreign key might already exist, continue
    }

    // Create foreign keys for feeding_records
    try {
      await queryRunner.createForeignKey(
        'feeding_records',
        new TableForeignKey({
          columnNames: ['batch_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'batchs',
          onDelete: 'CASCADE',
        }),
      );
    } catch (error) {
      // Foreign key might already exist, continue
    }

    try {
      await queryRunner.createForeignKey(
        'feeding_records',
        new TableForeignKey({
          columnNames: ['schedule_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'feeding_schedules',
          onDelete: 'SET NULL',
        }),
      );
    } catch (error) {
      // Foreign key might already exist, continue
    }

    try {
      await queryRunner.createForeignKey(
        'feeding_records',
        new TableForeignKey({
          columnNames: ['recorded_by'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'SET NULL',
        }),
      );
    } catch (error) {
      // Foreign key might already exist, continue
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys and table for feeding_records
    const feedingRecordsTable = await queryRunner.getTable('feeding_records');
    if (feedingRecordsTable) {
      const foreignKeys = feedingRecordsTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('feeding_records', foreignKey);
      }
      await queryRunner.dropIndex('feeding_records', 'idx_feeding_records_date');
      await queryRunner.dropIndex('feeding_records', 'idx_feeding_records_batch');
      await queryRunner.dropTable('feeding_records');
    }

    // Drop foreign keys and table for feeding_schedules
    const feedingSchedulesTable = await queryRunner.getTable('feeding_schedules');
    if (feedingSchedulesTable) {
      const foreignKeys = feedingSchedulesTable.foreignKeys;
      for (const foreignKey of foreignKeys) {
        await queryRunner.dropForeignKey('feeding_schedules', foreignKey);
      }
      await queryRunner.dropIndex('feeding_schedules', 'idx_feeding_batch');
      await queryRunner.dropTable('feeding_schedules');
    }
  }
}
