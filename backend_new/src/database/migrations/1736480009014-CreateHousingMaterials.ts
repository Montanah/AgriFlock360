
// migrations/XXXXXX-create-housing-materials.ts
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateHousingMaterials1736480009014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'housing_materials',
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
            length: '255',
          },
          {
            name: 'category',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'unit',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'unit_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '50',
            default: "'KES'",
          },
          {
            name: 'supplier',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'specifications',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_system_default',
            type: 'boolean',
            default: false,
          },
          {
            name: 'display_order',
            type: 'integer',
            default: 0,
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
      'housing_materials',
      new TableIndex({
        name: 'idx_housing_materials_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'housing_materials',
      new TableIndex({
        name: 'idx_housing_materials_category',
        columnNames: ['category'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('housing_materials', 'idx_housing_materials_category');
    await queryRunner.dropIndex('housing_materials', 'idx_housing_materials_name');
    await queryRunner.dropTable('housing_materials');
  }
}