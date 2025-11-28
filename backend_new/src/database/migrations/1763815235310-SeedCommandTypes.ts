import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedCommandTypes1763815235310 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create unique index first
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_command_type_name ON command_type (name);
        `);

        // Seed command types
        await queryRunner.query(`
            INSERT INTO command_type (name, description) VALUES
            ('set_temperature', 'Set target temperature for the brooder'),
            ('toggle_heater', 'Turn heater on/off'),
            ('toggle_fan', 'Turn fan on/off'),
            ('set_auto_mode', 'Enable/disable automatic temperature control'),
            ('unlock_payg', 'Unlock PAYG device'),
            ('lock_payg', 'Lock PAYG device'),
            ('reboot', 'Reboot the device'),
            ('get_status', 'Get device status'),
            ('update_firmware', 'Update device firmware')
            ON CONFLICT (name) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM command_type WHERE name IN (
                'set_temperature', 'toggle_heater', 'toggle_fan', 'set_auto_mode',
                'unlock_payg', 'lock_payg', 'reboot', 'get_status', 'update_firmware'
            );
        `);
    }
}
