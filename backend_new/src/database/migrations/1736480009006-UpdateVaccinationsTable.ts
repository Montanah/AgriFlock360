// migrations/XXXXXX-update-vaccinations-table.ts
import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class UpdateVaccinationsTable1736480009006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add vaccine_catalog_id column
    await queryRunner.addColumn(
      'vaccinations',
      new TableColumn({
        name: 'vaccine_catalog_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add administration_method column
    await queryRunner.addColumn(
      'vaccinations',
      new TableColumn({
        name: 'administration_method',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    // Add source column
    await queryRunner.addColumn(
      'vaccinations',
      new TableColumn({
        name: 'source',
        type: 'varchar',
        length: '50',
        default: "'manual'",
      }),
    );

    // Create foreign key to vaccine_catalog
    await queryRunner.createForeignKey(
      'vaccinations',
      new TableForeignKey({
        columnNames: ['vaccine_catalog_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'vaccine_catalog',
        onDelete: 'SET NULL',
      }),
    );

    // Create index on vaccine_catalog_id
    await queryRunner.createIndex(
      'vaccinations',
      new TableIndex({
        name: 'idx_vaccinations_vaccine_catalog',
        columnNames: ['vaccine_catalog_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('vaccinations', 'idx_vaccinations_vaccine_catalog');
    
    const table = await queryRunner.getTable('vaccinations');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        fk => fk.columnNames.indexOf('vaccine_catalog_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('vaccinations', foreignKey);
      }
    }

    await queryRunner.dropColumn('vaccinations', 'source');
    await queryRunner.dropColumn('vaccinations', 'administration_method');
    await queryRunner.dropColumn('vaccinations', 'vaccine_catalog_id');
  }
}