import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFirmwareVersionIdToDevices1764000000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE devices ADD COLUMN firmware_version_id UUID;
      ALTER TABLE devices ADD CONSTRAINT fk_devices_firmware_version_id
        FOREIGN KEY (firmware_version_id) REFERENCES firmware_versions(id) ON DELETE SET NULL;
      CREATE INDEX idx_firmware_device_version_id ON devices(firmware_version_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE devices DROP CONSTRAINT IF EXISTS fk_devices_firmware_version_id;
      DROP INDEX IF EXISTS idx_firmware_device_version_id;
      ALTER TABLE devices DROP COLUMN IF EXISTS firmware_version_id;
    `);
  }
}
