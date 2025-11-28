// migrations/XXXXXX-create-inventory-items.ts
import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateInventoryItems1736480009008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'inventory_items',
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
          },
          {
            name: 'farm_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'category_id',
            type: 'uuid',
          },
          {
            name: 'item_name',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'item_code',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'unit_of_measurement',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'current_stock',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'minimum_stock_level',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'reorder_point',
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0,
          },
          {
            name: 'cost_per_unit',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'supplier',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'supplier_contact',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'storage_location',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'last_restock_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'expiry_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'in_stock'",
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
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    const indexes = [
      { name: 'idx_inventory_items_user', columns: ['user_id'] },
      { name: 'idx_inventory_items_farm', columns: ['farm_id'] },
      { name: 'idx_inventory_items_category', columns: ['category_id'] },
      { name: 'idx_inventory_items_name', columns: ['item_name'] },
      { name: 'idx_inventory_items_stock', columns: ['current_stock'] },
    ];

    for (const index of indexes) {
      await queryRunner.createIndex(
        'inventory_items',
        new TableIndex({
          name: index.name,
          columnNames: index.columns,
        }),
      );
    }

    // Create foreign keys
    await queryRunner.createForeignKey(
      'inventory_items',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_items',
      new TableForeignKey({
        columnNames: ['farm_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'farms',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'inventory_items',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'inventory_categories',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('inventory_items');
    if (table) {
      for (const foreignKey of table.foreignKeys) {
        await queryRunner.dropForeignKey('inventory_items', foreignKey);
      }
    }

    const indexes = [
      'idx_inventory_items_stock',
      'idx_inventory_items_name',
      'idx_inventory_items_category',
      'idx_inventory_items_farm',
      'idx_inventory_items_user',
    ];

    for (const indexName of indexes) {
      await queryRunner.dropIndex('inventory_items', indexName);
    }

    await queryRunner.dropTable('inventory_items');
  }
}
