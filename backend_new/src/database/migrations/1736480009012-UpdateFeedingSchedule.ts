// migrations/XXXXXX-update-feeding-schedule.ts
import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class UpdateFeedingSchedule1736480009012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add recommendation_id column
    await queryRunner.addColumn(
      'feeding_schedules',
      new TableColumn({
        name: 'recommendation_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Add feeding_times column
    await queryRunner.addColumn(
      'feeding_schedules',
      new TableColumn({
        name: 'feeding_times',
        type: 'jsonb',
        isNullable: true,
      }),
    );

    // Add source column
    await queryRunner.addColumn(
      'feeding_schedules',
      new TableColumn({
        name: 'source',
        type: 'varchar',
        length: '50',
        default: "'manual'",
      }),
    );

    // Create foreign key to feeding_recommendations
    await queryRunner.createForeignKey(
      'feeding_schedules',
      new TableForeignKey({
        columnNames: ['recommendation_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'feeding_recommendations',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('feeding_schedules');
    if (table) {
      const foreignKey = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('recommendation_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('feeding_schedules', foreignKey);
      }
    }

    await queryRunner.dropColumn('feeding_schedules', 'source');
    await queryRunner.dropColumn('feeding_schedules', 'feeding_times');
    await queryRunner.dropColumn('feeding_schedules', 'recommendation_id');
  }
}
