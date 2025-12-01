// migrations/XXXXXX-create-housing-quotations.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateHousingQuotations1736480009016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'housing_quotations',
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
            name: 'bird_capacity',
            type: 'integer',
          },
          {
            name: 'materials',
            type: 'jsonb',
          },
          {
            name: 'materials_subtotal',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'labor_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 26.0,
          },
          {
            name: 'labor_cost',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'grand_total',
            type: 'decimal',
            precision: 12,
            scale: 2,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '50',
            default: "'KES'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'draft'",
          },
          {
            name: 'notes',
            type: 'text',
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

    // Create indexes
    const indexes = [
      { name: 'idx_housing_quotations_user', columns: ['user_id'] },
      { name: 'idx_housing_quotations_capacity', columns: ['bird_capacity'] },
      { name: 'idx_housing_quotations_date', columns: ['created_at'] },
    ];

    for (const index of indexes) {
      await queryRunner.createIndex(
        'housing_quotations',
        new TableIndex({
          name: index.name,
          columnNames: index.columns,
        }),
      );
    }

    // Create foreign key
    await queryRunner.createForeignKey(
      'housing_quotations',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('housing_quotations');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        fk => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('housing_quotations', foreignKey);
      }
    }

    await queryRunner.dropIndex('housing_quotations', 'idx_housing_quotations_date');
    await queryRunner.dropIndex('housing_quotations', 'idx_housing_quotations_capacity');
    await queryRunner.dropIndex('housing_quotations', 'idx_housing_quotations_user');
    await queryRunner.dropTable('housing_quotations');
  }
}