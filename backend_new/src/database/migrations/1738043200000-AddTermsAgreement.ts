import { QueryRunner } from "typeorm";

// migrations/1738043200000-AddTermsAgreement.ts
export class AddTermsAgreement1738043200000 {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN agreed_to_terms_at TIMESTAMPTZ
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN agreed_to_terms,
      DROP COLUMN agreed_to_terms_at
    `);
  }
}