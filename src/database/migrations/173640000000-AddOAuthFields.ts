import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOAuthFields1736460000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS google_id TEXT,
      ADD COLUMN IF NOT EXISTS apple_id TEXT,
      ADD COLUMN IF NOT EXISTS oauth_provider TEXT;

      CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
      CREATE INDEX IF NOT EXISTS idx_users_apple_id ON users(apple_id);
      CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON users(oauth_provider);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users 
      DROP COLUMN IF EXISTS google_id,
      DROP COLUMN IF EXISTS apple_id,
      DROP COLUMN IF EXISTS oauth_provider;
    `);
  }
}
