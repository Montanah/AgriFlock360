// migrations/XXXXXX-create-uploads-table.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUploadsTable1736464000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create uploads table
    await queryRunner.createTable(
      new Table({
        name: 'uploads',
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
            isNullable: true,
          },
          {
            name: 'original_filename',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'filename',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'file_url',
            type: 'text',
          },
          {
            name: 'file_type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'mime_type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'file_size',
            type: 'bigint',
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'entity_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'checksum',
            type: 'varchar',
            length: '64',
            isNullable: true,
          },
          {
            name: 'is_public',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'uploads',
      new TableIndex({
        name: 'idx_uploads_user',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'uploads',
      new TableIndex({
        name: 'idx_uploads_entity',
        columnNames: ['entity_type', 'entity_id'],
      }),
    );

    await queryRunner.createIndex(
      'uploads',
      new TableIndex({
        name: 'idx_uploads_file_type',
        columnNames: ['file_type'],
      }),
    );

    await queryRunner.createIndex(
      'uploads',
      new TableIndex({
        name: 'idx_uploads_category',
        columnNames: ['category'],
      }),
    );

    await queryRunner.createIndex(
      'uploads',
      new TableIndex({
        name: 'idx_uploads_created_at',
        columnNames: ['created_at'],
      }),
    );

    // Create foreign key to users table
    await queryRunner.createForeignKey(
      'uploads',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('uploads');
    
    if (table) {
      const foreignKey = table.foreignKeys.find(
        fk => fk.columnNames.indexOf('user_id') !== -1,
      );
      if (foreignKey) {
        await queryRunner.dropForeignKey('uploads', foreignKey);
      }
    }

    await queryRunner.dropIndex('uploads', 'idx_uploads_created_at');
    await queryRunner.dropIndex('uploads', 'idx_uploads_category');
    await queryRunner.dropIndex('uploads', 'idx_uploads_file_type');
    await queryRunner.dropIndex('uploads', 'idx_uploads_entity');
    await queryRunner.dropIndex('uploads', 'idx_uploads_user');
    await queryRunner.dropTable('uploads');
  }
}
