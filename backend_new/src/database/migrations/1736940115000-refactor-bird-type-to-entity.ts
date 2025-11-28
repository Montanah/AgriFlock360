import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class RefactorBirdTypeToEntity1736940115000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 0. Fix the broken foreign key constraint that references 'flocks' instead of 'batchs'
    try {
      // Drop the existing foreign key constraint that's pointing to 'flocks'
      await queryRunner.query(`ALTER TABLE feeding_schedules DROP CONSTRAINT IF EXISTS feeding_schedules_batch_id_fkey;`);
    } catch (error) {
      // Constraint might not exist, continue
    }

    // Create the corrected foreign key constraint pointing to 'batchs'
    try {
      await queryRunner.createForeignKey(
        'feeding_schedules',
        new TableForeignKey({
          columnNames: ['batch_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'batchs',
          onDelete: 'CASCADE',
        })
      );
    } catch (error) {
      // Constraint might already exist, continue
    }

    // 1. Create bird_types table
    await queryRunner.createTable(
      new Table({
        name: 'bird_types',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'description',
            type: 'text',
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

    // 2. Add index for bird_types name
    await queryRunner.createIndex(
      'bird_types',
      new TableIndex({
        name: 'idx_bird_types_name',
        columnNames: ['name'],
      }),
    );

    // 3. Insert existing bird types
    await queryRunner.query(`
      INSERT INTO bird_types (id, name, description, notes, created_at) VALUES
      ('d7a8b9c4-1234-5678-9abc-def012345678', 'Broiler', 'Broiler chicken type - fast-growing meat birds', 'Optimized for poultry meat production', CURRENT_TIMESTAMP),
      ('e8b9c4d5-2345-6789-abcd-123456789012', 'Layer', 'Layer chicken type - egg-laying hens', 'Optimized for egg production', CURRENT_TIMESTAMP);
    `);

    // 4. Add bird_type_id column to batchs table
    await queryRunner.addColumn(
      'batchs',
      new TableColumn({
        name: 'bird_type_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // 5. Update existing batches to set bird_type_id based on enum value
    await queryRunner.query(`
      UPDATE batchs
      SET bird_type_id = 'd7a8b9c4-1234-5678-9abc-def012345678'
      WHERE bird_type = 'broiler';
    `);

    await queryRunner.query(`
      UPDATE batchs
      SET bird_type_id = 'e8b9c4d5-2345-6789-abcd-123456789012'
      WHERE bird_type = 'layer';
    `);

    // 6. Make bird_type_id not nullable now that it's populated
    await queryRunner.changeColumn(
      'batchs',
      'bird_type_id',
      new TableColumn({
        name: 'bird_type_id',
        type: 'uuid',
        isNullable: false,
      }),
    );

    // 7. Remove the old bird_type enum column
    await queryRunner.dropColumn('batchs', 'bird_type');

    // 8. Add foreign key constraint
    await queryRunner.createForeignKey(
      'batchs',
      new TableForeignKey({
        columnNames: ['bird_type_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'bird_types',
        onDelete: 'RESTRICT', // Prevent deletion of bird types that have batches
      }),
    );

    // 9. Add index for batchs bird_type_id
    await queryRunner.createIndex(
      'batchs',
      new TableIndex({
        name: 'idx_batchs_bird_type',
        columnNames: ['bird_type_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse the migration

    // 1. Drop foreign key and index
    const batchTable = await queryRunner.getTable('batchs');
    if (batchTable) {
      const foreignKey = batchTable.foreignKeys.find(
        (fk) => fk.columnNames.includes('bird_type_id') && fk.referencedTableName === 'bird_types',
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('batchs', foreignKey);
      }
    }

    await queryRunner.dropIndex('batchs', 'idx_batchs_bird_type');

    // 2. Add back the bird_type enum column
    await queryRunner.addColumn(
      'batchs',
      new TableColumn({
        name: 'bird_type',
        type: 'enum',
        enum: ['broiler', 'layer'],
        isNullable: false,
      }),
    );

    // 3. Populate the enum column based on bird_type_id
    await queryRunner.query(`
      UPDATE batchs
      SET bird_type = 'broiler'
      WHERE bird_type_id = 'd7a8b9c4-1234-5678-9abc-def012345678';
    `);

    await queryRunner.query(`
      UPDATE batchs
      SET bird_type = 'layer'
      WHERE bird_type_id = 'e8b9c4d5-2345-6789-abcd-123456789012';
    `);

    // 4. Drop bird_type_id column
    await queryRunner.dropColumn('batchs', 'bird_type_id');

    // 5. Drop bird_types table and its index
    await queryRunner.dropIndex('bird_types', 'idx_bird_types_name');
    await queryRunner.dropTable('bird_types');

    // Note: Created_at values will be lost, but that's acceptable for migration reversal
  }
}
