1736480009011


// migrations/XXXXXX-create-feeding-recommendations.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateFeedingRecommendations1736480009011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'feeding_recommendations',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'bird_type_id',
            type: 'uuid',
          },
          {
            name: 'stage_name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'age_start',
            type: 'integer',
          },
          {
            name: 'age_end',
            type: 'integer',
          },
          {
            name: 'feed_type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'protein_percentage',
            type: 'decimal',
            precision: 5,
            scale: 2,
          },
          {
            name: 'quantity_per_bird_per_day',
            type: 'decimal',
            precision: 10,
            scale: 3,
          },
          {
            name: 'times_per_day',
            type: 'integer',
            default: 2,
          },
          {
            name: 'feeding_times',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'supplements',
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
      'feeding_recommendations',
      new TableIndex({
        name: 'idx_feeding_rec_bird_type',
        columnNames: ['bird_type_id'],
      }),
    );

    await queryRunner.createIndex(
      'feeding_recommendations',
      new TableIndex({
        name: 'idx_feeding_rec_age',
        columnNames: ['age_start', 'age_end'],
      }),
    );

    // Create foreign key
    await queryRunner.createForeignKey(
      'feeding_recommendations',
      new TableForeignKey({
        columnNames: ['bird_type_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'bird_types',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('feeding_recommendations');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        fk => fk.columnNames.indexOf('bird_type_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('feeding_recommendations', foreignKey);
      }
    }

    await queryRunner.dropIndex('feeding_recommendations', 'idx_feeding_rec_age');
    await queryRunner.dropIndex('feeding_recommendations', 'idx_feeding_rec_bird_type');
    await queryRunner.dropTable('feeding_recommendations');
  }
}
