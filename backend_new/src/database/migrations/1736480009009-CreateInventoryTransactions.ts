
// migrations/XXXXXX-create-inventory-transactions.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateInventoryTransactions1736480009009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'inventory_transactions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'inventory_item_id',
            type: 'uuid',
          },
          {
            name: 'user_id',
            type: 'uuid',
          },
          {
            name: 'transaction_type',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'quantity',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'quantity_before',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'quantity_after',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'cost_per_unit',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'total_cost',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'transaction_date',
            type: 'date',
          },
          {
            name: 'reference_number',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'batch_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
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
    const indexes = [
      { name: 'idx_inventory_transactions_item', columns: ['inventory_item_id'] },
      { name: 'idx_inventory_transactions_type', columns: ['transaction_type'] },
      { name: 'idx_inventory_transactions_date', columns: ['transaction_date'] },
      { name: 'idx_inventory_transactions_user', columns: ['user_id'] },
    ];

    for (const index of indexes) {
      await queryRunner.createIndex(
        'inventory_transactions',
        new TableIndex({
          name: index.name,
          columnNames: index.columns,
        }),
      );
    }

    // Create foreign keys
    await queryRunner.createForeignKey(
      'inventory_transactions',
      new TableForeignKey({
        columnNames: ['inventory_item_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'inventory_items',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_transactions',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('inventory_transactions');
    if (table) {
      for (const foreignKey of table.foreignKeys) {
        await queryRunner.dropForeignKey('inventory_transactions', foreignKey);
      }
    }

    const indexes = [
      'idx_inventory_transactions_user',
      'idx_inventory_transactions_date',
      'idx_inventory_transactions_type',
      'idx_inventory_transactions_item',
    ];

    for (const indexName of indexes) {
      await queryRunner.dropIndex('inventory_transactions', indexName);
    }

    await queryRunner.dropTable('inventory_transactions');
  }
}