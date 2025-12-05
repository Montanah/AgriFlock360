import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCommandTypeDescToDescription1763815139679
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Rename column 'desc' to 'description' to match entity
    await queryRunner.query(`
            ALTER TABLE command_type RENAME COLUMN "desc" TO description;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rename back to 'desc'
    await queryRunner.query(`
            ALTER TABLE command_type RENAME COLUMN description TO "desc";
        `);
  }
}
