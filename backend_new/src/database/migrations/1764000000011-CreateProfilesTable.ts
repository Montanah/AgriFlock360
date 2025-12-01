import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateProfilesTable1234567890123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create profiles table
    await queryRunner.createTable(
      new Table({
        name: 'profiles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isUnique: true,
          },
          // Basic Information
          {
            name: 'full_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'national_id',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'phone_number',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'calling_code',
            type: 'varchar',
            length: '10',
            default: "'+254'",
          },
          {
            name: 'date_of_birth',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'gender',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'location',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'avatar',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          // Farm/Poultry Information
          {
            name: 'farm_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'years_of_experience',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'poultry_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'chicken_house_capacity',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'current_number_of_chickens',
            type: 'integer',
            isNullable: true,
          },
          // Preferred Suppliers
          {
            name: 'preferred_agrovet_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'preferred_feed_company',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'preferred_chicks_company',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'preferred_offtaker_agent',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'age',
            type: 'integer',
            isNullable: true,
          }
        ],
      }),
      true,
    );

    // Add foreign key to users table
    await queryRunner.createForeignKey(
      'profiles',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    // Add foreign key to farms table
    await queryRunner.createForeignKey(
      'profiles',
      new TableForeignKey({
        columnNames: ['farm_id'],
        referencedTableName: 'farms',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    // Migrate data from users table to profiles table
    await queryRunner.query(`
      INSERT INTO profiles (
        user_id,
        full_name,
        phone_number,
        calling_code,
        date_of_birth,
        age,
        gender,
        location,
        avatar,
        farm_id,
        created_at,
        updated_at
      )
      SELECT
        id,
        COALESCE(name, CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, ''))),
        phone_number,
        calling_code,
        date_of_birth,
        age::INTEGER,
        gender,
        location,
        avatar,
        farm_id,
        created_at,
        updated_at
      FROM users
      WHERE phone_number IS NOT NULL;
    `);

    // Drop columns from users table
   // await queryRunner.dropColumn('users', 'name');
    await queryRunner.dropColumn('users', 'first_name');
    await queryRunner.dropColumn('users', 'last_name');
    //await queryRunner.dropColumn('users', 'phone_number');
    await queryRunner.dropColumn('users', 'calling_code');
    await queryRunner.dropColumn('users', 'location');
  //  await queryRunner.dropColumn('users', 'avatar');
    await queryRunner.dropColumn('users', 'date_of_birth');
    await queryRunner.dropColumn('users', 'age');
    await queryRunner.dropColumn('users', 'gender');
    await queryRunner.dropColumn('users', 'farm_id');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add columns back to users table
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN name varchar(255),
      ADD COLUMN first_name varchar(255),
      ADD COLUMN last_name varchar(255),
      ADD COLUMN phone_number varchar(20),
      ADD COLUMN calling_code varchar(10) DEFAULT '+254',
      ADD COLUMN location text,
      ADD COLUMN avatar varchar(255),
      ADD COLUMN date_of_birth date,
      ADD COLUMN age text,
      ADD COLUMN gender text,
      ADD COLUMN farm_id uuid;
    `);

    // Migrate data back from profiles to users
    await queryRunner.query(`
      UPDATE users u
      SET 
        name = p.full_name,
        phone_number = p.phone_number,
        calling_code = p.calling_code,
        date_of_birth = p.date_of_birth,
        gender = p.gender,
        location = p.location,
        avatar = p.avatar,
        farm_id = p.farm_id
      FROM profiles p
      WHERE u.id = p.user_id;
    `);

    // Drop profiles table
    await queryRunner.dropTable('profiles');
  }
}
