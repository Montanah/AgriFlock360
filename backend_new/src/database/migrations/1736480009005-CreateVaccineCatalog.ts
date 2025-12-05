// migrations/XXXXXX-create-vaccine-catalog.ts
import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateVaccineCatalog1736480009005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'vaccine_catalog',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'vaccine_name',
            type: 'varchar',
            length: '255',
            isUnique: true,
          },
          {
            name: 'vaccine_type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'manufacturer',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'brand_name',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'recommended_age_min',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'recommended_age_max',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'recommended_age_description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'dosage',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'administration_method',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'usage_instructions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'precautions',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'side_effects',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'withdrawal_period_days',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'storage_conditions',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'estimated_cost_per_dose',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'target_disease',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'bird_type',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'is_recommended',
            type: 'boolean',
            default: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'usage_count',
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
      'vaccine_catalog',
      new TableIndex({
        name: 'idx_vaccine_catalog_name',
        columnNames: ['vaccine_name'],
      }),
    );

    await queryRunner.createIndex(
      'vaccine_catalog',
      new TableIndex({
        name: 'idx_vaccine_catalog_type',
        columnNames: ['vaccine_type'],
      }),
    );

    await queryRunner.createIndex(
      'vaccine_catalog',
      new TableIndex({
        name: 'idx_vaccine_catalog_active',
        columnNames: ['is_active'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'vaccine_catalog',
      'idx_vaccine_catalog_active',
    );
    await queryRunner.dropIndex('vaccine_catalog', 'idx_vaccine_catalog_type');
    await queryRunner.dropIndex('vaccine_catalog', 'idx_vaccine_catalog_name');
    await queryRunner.dropTable('vaccine_catalog');
  }
}
