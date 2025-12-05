// database/migrations/1736467000000-OtaSystem.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class OtaSystem1736467000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Firmware Versions Table
      CREATE TABLE IF NOT EXISTS firmware_versions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        version VARCHAR(50) NOT NULL,
        device_type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        changelog TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_hash VARCHAR(64) NOT NULL,
        file_size BIGINT NOT NULL,
        release_type VARCHAR(20) DEFAULT 'stable',
        is_mandatory BOOLEAN DEFAULT false,
        status VARCHAR(20) DEFAULT 'draft',
        min_version VARCHAR(50),
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        released_at TIMESTAMPTZ,
        UNIQUE(version, device_type)
      );
      CREATE INDEX IF NOT EXISTS idx_firmware_version ON firmware_versions(version);
      CREATE INDEX IF NOT EXISTS idx_firmware_device_type ON firmware_versions(device_type);

      -- OTA Updates Table
      CREATE TABLE IF NOT EXISTS ota_updates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
        firmware_id UUID NOT NULL REFERENCES firmware_versions(id),
        current_version VARCHAR(50),
        target_version VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        progress INTEGER DEFAULT 0,
        scheduled_at TIMESTAMPTZ,
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_ota_device ON ota_updates(device_id);
      CREATE INDEX IF NOT EXISTS idx_ota_status ON ota_updates(status);
      CREATE INDEX IF NOT EXISTS idx_ota_scheduled ON ota_updates(scheduled_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS ota_updates CASCADE;
      DROP TABLE IF EXISTS firmware_versions CASCADE;
    `);
  }
}
