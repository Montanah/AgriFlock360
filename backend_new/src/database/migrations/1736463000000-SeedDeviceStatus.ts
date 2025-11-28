import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDeviceStatus1736463000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add unique index on name for conflict handling
        await queryRunner.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_device_status_name ON device_status (name);
        `);

        // Insert device statuses with conflict handling
        await queryRunner.query(`
            INSERT INTO device_status (name, "desc") VALUES
            ('registered', 'Device registered but not activated'),
            ('active', 'Device is online and functioning'),
            ('offline', 'Device is offline'),
            ('maintenance', 'Device is under maintenance'),
            ('deactivated', 'Device has been deactivated'),
            ('error', 'Device is in error state')
            ON CONFLICT (name) DO NOTHING;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM device_status WHERE name IN (
                'registered', 'active', 'offline', 'maintenance', 'deactivated', 'error'
            );
        `);
    }
}
