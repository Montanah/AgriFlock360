import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateLoginAttemptsIdentifier1736468000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE login_attempts RENAME COLUMN email TO identifier;
    `);

    // Recreate the index with new column name
    await queryRunner.query(`DROP INDEX IF EXISTS idx_login_attempts_email_time;`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier_time ON login_attempts(identifier, created_at DESC);`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_login_attempts_identifier_time;`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON login_attempts(identifier, created_at DESC);`);

    await queryRunner.query(`
      ALTER TABLE login_attempts RENAME COLUMN identifier TO email;
    `);
  }
}
