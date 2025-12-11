// database/migrations/1736466000000-SystemConfig.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SystemConfig1736466000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS system_config (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        meta JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_by UUID REFERENCES users(id) ON DELETE SET NULL
      );

      -- Insert default configs
      INSERT INTO system_config (key, value, description, meta) VALUES
      (
        'payg_daily_rate', 
        '{"amount": 20, "currency": "KES"}', 
        'Daily PAYG rate',
        '{}'
      ),
      (
        'alert_thresholds', 
        '{"temp_high": 35, "temp_low": 20, "humidity_low": 40, "humidity_high": 70}', 
        'Alert threshold values',
        '{}'
      ),
      (
        'maintenance_mode', 
        '{"enabled": false}', 
        'System maintenance status',
        '{}'
      ),
      (
        'notification_settings',
        '{"email_enabled": true, "sms_enabled": false, "push_enabled": true}',
        'Global notification settings',
        '{}'
      ),
      (
        'payg_low_balance_threshold',
        '{"days": 3, "amount": 60}',
        'Threshold for low balance alerts',
        '{}'
      )
      ON CONFLICT (key) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS system_config CASCADE;`);
  }
}
