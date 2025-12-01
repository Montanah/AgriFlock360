// migrations/XXXXXX-create-housing-quantities.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateHousingQuantities1736480009015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'housing_quantities',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'material_id',
            type: 'uuid',
          },
          {
            name: 'bird_capacity',
            type: 'integer',
          },
          {
            name: 'quantity_needed',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'housing_quantities',
      new TableIndex({
        name: 'idx_housing_quantities_material',
        columnNames: ['material_id'],
      }),
    );

    await queryRunner.createIndex(
      'housing_quantities',
      new TableIndex({
        name: 'idx_housing_quantities_capacity',
        columnNames: ['bird_capacity'],
      }),
    );

    // Create unique constraint
    await queryRunner.createIndex(
      'housing_quantities',
      new TableIndex({
        name: 'idx_housing_quantities_unique',
        columnNames: ['material_id', 'bird_capacity'],
        isUnique: true,
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'housing_quantities',
      new TableForeignKey({
        columnNames: ['material_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'housing_materials',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('housing_quantities');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        fk => fk.columnNames.indexOf('material_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('housing_quantities', foreignKey);
      }
    }

    await queryRunner.dropIndex('housing_quantities', 'idx_housing_quantities_unique');
    await queryRunner.dropIndex('housing_quantities', 'idx_housing_quantities_capacity');
    await queryRunner.dropIndex('housing_quantities', 'idx_housing_quantities_material');
    await queryRunner.dropTable('housing_quantities');
  }
}