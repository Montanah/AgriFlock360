import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBatchRelatedTables1736480005000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create batch_history table
    if (!(await queryRunner.hasTable('batch_history'))) {
      await queryRunner.createTable(
      new Table({
        name: 'batch_history',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'batch_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'previous_count',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'current_count',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'change_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'change_amount',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'hatch_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: true,
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
            name: 'batch_status',
            type: 'varchar',
            length: '20',
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

    // Create vaccinations table
    if (!(await queryRunner.hasTable('vaccinations'))) {
      await queryRunner.createTable(
      new Table({
        name: 'vaccinations',
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
            name: 'vaccine_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'vaccine_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'scheduled_date',
            type: 'date',
            isNullable: false,
          },
          {
            name: 'completed_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'vaccination_status',
            type: 'varchar',
            length: '20',
            default: 'scheduled',
            isNullable: false,
          },
          {
            name: 'dosage',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'administered_by',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'birds_vaccinated',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'reminder_sent',
            type: 'boolean',
            default: false,
            isNullable: false,
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
    ); }

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

    // Create weight_samples table
    if (!(await queryRunner.hasTable('weight_samples'))) {
      await queryRunner.createTable(
      new Table({
        name: 'weight_samples',
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
            isNullable: true,
          },
          {
            name: 'sample_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'sample_size',
            type: 'integer',
            default: 10,
            isNullable: false,
          },
          {
            name: 'average_weight_grams',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'min_weight_grams',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'max_weight_grams',
            type: 'decimal',
            precision: 8,
            scale: 2,
            isNullable: true,
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
        ],
      }),
      true,
    );
    }

    // Create all indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_batch_history_batch ON batch_history(batch_id);
      CREATE INDEX IF NOT EXISTS idx_batch_history_created_by ON batch_history(created_by);
      CREATE INDEX IF NOT EXISTS idx_batch_history_created ON batch_history(created_at);
      CREATE INDEX IF NOT EXISTS idx_batch_history_change_type ON batch_history(change_type);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_vaccinations_batch ON vaccinations(batch_id);
      CREATE INDEX IF NOT EXISTS idx_vaccinations_status ON vaccinations(vaccination_status);
      CREATE INDEX IF NOT EXISTS idx_vaccinations_scheduled ON vaccinations(scheduled_date);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_feeding_batch ON feeding_schedules(batch_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_feeding_records_batch ON feeding_records(batch_id);
      CREATE INDEX IF NOT EXISTS idx_feeding_records_date ON feeding_records(fed_at);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_weight_samples_batch ON weight_samples(batch_id);
      CREATE INDEX IF NOT EXISTS idx_weight_samples_date ON weight_samples(sample_date);
    `);

    // Create all foreign keys
    try {
      await queryRunner.createForeignKey(
        'batch_history',
        new TableForeignKey({
          columnNames: ['created_by'],
          referencedColumnNames: ['id'],
          referencedTableName: 'users',
          onDelete: 'SET NULL',
        }),
      );
    } catch (error) {
      // Foreign key might already exist, continue
    }

    try {
      await queryRunner.createForeignKey(
        'batch_history',
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
        'vaccinations',
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

    try {
      await queryRunner.createForeignKey(
        'weight_samples',
        new TableForeignKey({
          columnNames: ['batch_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'batchs',
          onDelete: 'SET NULL',
        }),
      );
    } catch (error) {
      // Foreign key might already exist, continue
    }

    try {
      await queryRunner.createForeignKey(
        'weight_samples',
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
}

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = ['weight_samples', 'feeding_records', 'feeding_schedules', 'vaccinations', 'batch_history'];

    for (const tableName of tables) {
      const table = await queryRunner.getTable(tableName);
      if (table) {
        // Drop foreign keys
        const foreignKeys = table.foreignKeys || [];
        for (const foreignKey of foreignKeys) {
          await queryRunner.dropForeignKey(tableName, foreignKey);
        }

        // Drop indexes
        const indices = table.indices || [];
        for (const index of indices) {
          await queryRunner.dropIndex(tableName, index);
        }

        // Drop table
        await queryRunner.dropTable(tableName);
      }
    }
  }
}
