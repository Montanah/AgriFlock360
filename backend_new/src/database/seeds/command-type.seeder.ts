// database/seeders/command-type.seeder.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCommandType1736464000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO command_type (name, "desc") VALUES
      ('set_temperature', 'Set target temperature'),
      ('toggle_heater', 'Turn heater on/off'),
      ('toggle_fan', 'Turn fan on/off'),
      ('set_auto_mode', 'Enable/disable automatic mode'),
      ('unlock_payg', 'Unlock pay-as-you-go device'),
      ('lock_payg', 'Lock pay-as-you-go device'),
      ('reboot', 'Reboot device'),
      ('update_firmware', 'Update device firmware'),
      ('get_status', 'Request device status'),
      ('calibrate', 'Calibrate sensors')
      ON CONFLICT (name) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM command_type WHERE name IN (
        'set_temperature', 'toggle_heater', 'toggle_fan', 'set_auto_mode',
        'unlock_payg', 'lock_payg', 'reboot', 'update_firmware', 'get_status', 'calibrate'
      );
    `);
  }
}