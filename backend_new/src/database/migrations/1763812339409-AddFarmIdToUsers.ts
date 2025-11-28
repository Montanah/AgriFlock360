import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFarmIdToUsers1763812339409 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS farm_id UUID references farms(id) ON DELETE SET NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE users
            DROP COLUMN IF EXISTS farm_id;
        `);
    }

}
