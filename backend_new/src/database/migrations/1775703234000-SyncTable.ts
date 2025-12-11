import { MigrationInterface, QueryRunner } from 'typeorm';

export class SyncTable1775703234000 implements MigrationInterface {
  name = 'SyncTable1775703234000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "sync_operation_type_enum" AS ENUM('CREATE', 'UPDATE', 'DELETE')
    `);
    await queryRunner.query(`
      CREATE TYPE "sync_entity_type_enum" AS ENUM('FARM', 'BATCH', 'DEVICE', 'VACCINATION', 'FEEDING_RECORD')
    `);
    await queryRunner.query(`
      CREATE TYPE "sync_status_enum" AS ENUM('PENDING', 'PROCESSING', 'SYNCED', 'CONFLICT', 'FAILED')
    `);
    await queryRunner.query(`
      CREATE TABLE "syncs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "operation_id" character varying(255) NOT NULL,
        "operation_type" "sync_operation_type_enum" NOT NULL,
        "entity_type" "sync_entity_type_enum" NOT NULL,
        "entity_id" character varying(255),
        "server_entity_id" character varying(255),
        "operation_data" jsonb NOT NULL,
        "status" "sync_status_enum" NOT NULL DEFAULT 'PENDING',
        "conflict_reason" text,
        "server_version" bigint,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_syncs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_sync_user" ON "syncs" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "idx_sync_status" ON "syncs" ("status")
    `);
    await queryRunner.query(`
      ALTER TABLE "syncs" ADD CONSTRAINT "FK_sync_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "syncs" DROP CONSTRAINT "FK_sync_user"`);
    await queryRunner.query(`DROP INDEX "idx_sync_status"`);
    await queryRunner.query(`DROP INDEX "idx_sync_user"`);
    await queryRunner.query(`DROP TABLE "syncs"`);
    await queryRunner.query(`DROP TYPE "sync_status_enum"`);
    await queryRunner.query(`DROP TYPE "sync_entity_type_enum"`);
    await queryRunner.query(`DROP TYPE "sync_operation_type_enum"`);
  }
}
