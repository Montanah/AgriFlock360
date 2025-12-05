import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLockedUntilField1763725742256 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE users
            DROP COLUMN IF EXISTS locked_until;
        `);
  }
}
