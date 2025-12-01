import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAgeAndSupplierToFeedingRecords1764000000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE feeding_records ADD COLUMN age INTEGER DEFAULT 0;
      ALTER TABLE feeding_records ADD COLUMN supplier VARCHAR(100);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE feeding_records DROP COLUMN IF EXISTS age;
      ALTER TABLE feeding_records DROP COLUMN IF EXISTS supplier;
    `);
  }
}
