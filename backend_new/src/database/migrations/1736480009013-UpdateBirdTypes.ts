// migrations/XXXXXX-update-bird-types.ts
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class UpdateBirdTypes1736480009013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add category column
    await queryRunner.addColumn(
      'bird_types',
      new TableColumn({
        name: 'category',
        type: 'varchar',
        length: '100',
        isNullable: true,
      }),
    );

    // Add is_active column
    await queryRunner.addColumn(
      'bird_types',
      new TableColumn({
        name: 'is_active',
        type: 'boolean',
        default: true,
      }),
    );

    // Add updated_at if doesn't exist
    const table = await queryRunner.getTable('bird_types');
    const hasUpdatedAt = table?.columns.find(
      (col) => col.name === 'updated_at',
    );

    if (!hasUpdatedAt) {
      await queryRunner.addColumn(
        'bird_types',
        new TableColumn({
          name: 'updated_at',
          type: 'timestamptz',
          default: 'CURRENT_TIMESTAMP',
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('bird_types', 'is_active');
    await queryRunner.dropColumn('bird_types', 'category');
  }
}
