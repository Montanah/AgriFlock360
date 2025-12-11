import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddUserProfileFields1764000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('users', [
      new TableColumn({
        name: 'avatar',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
      new TableColumn({
        name: 'date_of_birth',
        type: 'date',
        isNullable: true,
      }),
      new TableColumn({
        name: 'age',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'gender',
        type: 'text',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'avatar');
    await queryRunner.dropColumn('users', 'date_of_birth');
    await queryRunner.dropColumn('users', 'age');
    await queryRunner.dropColumn('users', 'gender');
  }
}
