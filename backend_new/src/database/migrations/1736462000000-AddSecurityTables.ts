import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSecurityTables1736462000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Add locked_until to users
      ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ;

      -- Two Factor Auth
      CREATE TABLE IF NOT EXISTS two_factor_auth (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        secret TEXT NOT NULL,
        is_enabled BOOLEAN DEFAULT false,
        backup_codes TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id)
      );

      -- Login Attempts
      CREATE TABLE IF NOT EXISTS login_attempts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT NOT NULL,
        ip_address INET NOT NULL,
        success BOOLEAN NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON login_attempts(email, created_at DESC);

      -- Rate Limit Logs
      CREATE TABLE IF NOT EXISTS rate_limit_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        identifier TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        ip_address INET,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_time ON rate_limit_logs(identifier, created_at DESC);

      -- User Sessions
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        refresh_token_hash TEXT NOT NULL,
        ip_address INET NOT NULL,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true,
        expires_at TIMESTAMPTZ NOT NULL,
        last_activity TIMESTAMPTZ NOT NULL,
        invalidated_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON user_sessions(user_id, is_active);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS user_sessions CASCADE;
      DROP TABLE IF EXISTS rate_limit_logs CASCADE;
      DROP TABLE IF EXISTS login_attempts CASCADE;
      DROP TABLE IF EXISTS two_factor_auth CASCADE;
      ALTER TABLE users DROP COLUMN IF EXISTS locked_until;
    `);
  }
}
