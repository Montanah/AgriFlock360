import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGpsCoordinatesToFarms1764000000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE farms ADD COLUMN IF NOT EXISTS gps_coordinates JSONB;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE farms DROP COLUMN IF EXISTS gps_coordinates;
    `);
  }
}
