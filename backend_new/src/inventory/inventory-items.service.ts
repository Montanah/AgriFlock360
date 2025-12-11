// inventory/services/inventory-items.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { InventoryItem } from '../database/entities/InventoryItem.entity';
import { InventoryCategory } from '../database/entities/InventoryCategory.entity';
import { InventoryTransaction } from '../database/entities/InventoryTransaction.entity';
import {
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  CreateTransactionDto,
  QueryInventoryDto,
  QueryTransactionsDto,
} from './dto/inventory.dto';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class InventoryItemsService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(InventoryCategory)
    private categoryRepository: Repository<InventoryCategory>,
    @InjectRepository(InventoryTransaction)
    private transactionRepository: Repository<InventoryTransaction>,
    private logger: CustomLogger,
  ) {}

  async createItem(
    userId: string,
    createDto: CreateInventoryItemDto,
  ): Promise<InventoryItem> {
    // Verify category exists
    const category = await this.categoryRepository.findOne({
      where: { id: createDto.category_id },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const item = this.inventoryRepository.create({
      ...createDto,
      user_id: userId,
    });

    // Auto-set reorder point if not provided (default to minimum stock + 10%)
    if (!item.reorder_point) {
      item.reorder_point = item.minimum_stock_level * 1.1;
    }

    // Determine initial status
    item.status = this.determineStatus(
      item.current_stock,
      item.minimum_stock_level,
    );
    item.last_restock_date = new Date();

    await this.inventoryRepository.save(item);

    // Create initial transaction
    if (item.current_stock > 0) {
      await this.createTransaction(item.id, userId, {
        transaction_type: 'adjustment',
        quantity: item.current_stock,
        transaction_date: new Date(),
        notes: 'Initial stock',
      });
    }

    this.logger.log(
      `Inventory item created: ${item.item_name} by user ${userId}`,
    );

    return this.getItem(item.id, userId);
  }

  async getItems(userId: string, query: QueryInventoryDto) {
    const {
      search,
      category_id,
      farm_id,
      status,
      low_stock_only,
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.farm', 'farm')
      .where('item.user_id = :userId', { userId })
      .skip(skip)
      .take(limit)
      .orderBy('item.item_name', 'ASC');

    if (search) {
      queryBuilder.andWhere(
        '(item.item_name ILIKE :search OR item.item_code ILIKE :search OR item.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (category_id) {
      queryBuilder.andWhere('item.category_id = :category_id', { category_id });
    }

    if (farm_id) {
      queryBuilder.andWhere('item.farm_id = :farm_id', { farm_id });
    }

    if (status) {
      queryBuilder.andWhere('item.status = :status', { status });
    }

    if (low_stock_only) {
      queryBuilder.andWhere('item.current_stock <= item.minimum_stock_level');
    }

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getItem(itemId: string, userId: string): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({
      where: { id: itemId },
      relations: ['category', 'farm'],
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    if (item.user_id !== userId) {
      throw new ForbiddenException('Not authorized to access this item');
    }

    return item;
  }

  async updateItem(
    itemId: string,
    userId: string,
    updateDto: UpdateInventoryItemDto,
  ): Promise<InventoryItem> {
    const item = await this.getItem(itemId, userId);

    // Verify category if being changed
    if (updateDto.category_id && updateDto.category_id !== item.category_id) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateDto.category_id },
      });

      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    Object.assign(item, updateDto);

    // Recalculate status if minimum stock changed
    if (updateDto.minimum_stock_level !== undefined) {
      item.status = this.determineStatus(
        item.current_stock,
        item.minimum_stock_level,
      );
    }

    await this.inventoryRepository.save(item);

    this.logger.log(`Inventory item updated: ${item.item_name}`);

    return this.getItem(itemId, userId);
  }

  async deleteItem(itemId: string, userId: string): Promise<void> {
    const item = await this.getItem(itemId, userId);

    await this.inventoryRepository.remove(item);

    this.logger.log(`Inventory item deleted: ${item.item_name}`);
  }

  // Transaction Management

  async createTransaction(
    itemId: string,
    userId: string,
    createDto: CreateTransactionDto,
  ): Promise<InventoryTransaction> {
    const item = await this.getItem(itemId, userId);

    const quantityBefore = Number(item.current_stock);
    let quantityAfter: number;

    // Calculate new stock based on transaction type
    switch (createDto.transaction_type) {
      case 'purchase':
      case 'return':
        quantityAfter = quantityBefore + createDto.quantity;
        break;
      case 'usage':
      case 'wastage':
        if (quantityBefore < createDto.quantity) {
          throw new BadRequestException(
            'Insufficient stock for this transaction',
          );
        }
        quantityAfter = quantityBefore - createDto.quantity;
        break;
      case 'adjustment':
        // Adjustment can be positive or negative
        quantityAfter = quantityBefore + createDto.quantity;
        if (quantityAfter < 0) {
          throw new BadRequestException(
            'Adjustment would result in negative stock',
          );
        }
        break;
      default:
        throw new BadRequestException('Invalid transaction type');
    }

    // Calculate total cost
    const costPerUnit = createDto.cost_per_unit || item.cost_per_unit || 0;
    const totalCost = Math.abs(createDto.quantity) * costPerUnit;

    // Create transaction
    const transaction = this.transactionRepository.create({
      inventory_item_id: itemId,
      user_id: userId,
      transaction_type: createDto.transaction_type,
      quantity: createDto.quantity,
      quantity_before: quantityBefore,
      quantity_after: quantityAfter,
      cost_per_unit: costPerUnit,
      total_cost: totalCost,
      transaction_date: createDto.transaction_date,
      reference_number: createDto.reference_number,
      notes: createDto.notes,
      batch_id: createDto.batch_id,
      metadata: createDto.metadata,
    });

    await this.transactionRepository.save(transaction);

    // Update item stock
    item.current_stock = quantityAfter;
    item.status = this.determineStatus(quantityAfter, item.minimum_stock_level);

    if (createDto.transaction_type === 'purchase') {
      item.last_restock_date = createDto.transaction_date;

      // Update cost per unit if provided
      if (createDto.cost_per_unit) {
        item.cost_per_unit = createDto.cost_per_unit;
      }
    }

    await this.inventoryRepository.save(item);

    this.logger.log(
      `Inventory transaction: ${createDto.transaction_type} ${createDto.quantity} ${item.unit_of_measurement} of ${item.item_name}`,
    );

    return transaction;
  }

  async getItemTransactions(
    itemId: string,
    userId: string,
    query: QueryTransactionsDto,
  ) {
    const item = await this.getItem(itemId, userId);

    const {
      transaction_type,
      start_date,
      end_date,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.inventory_item_id = :itemId', { itemId })
      .skip(skip)
      .take(limit)
      .orderBy('transaction.transaction_date', 'DESC')
      .addOrderBy('transaction.created_at', 'DESC');

    if (transaction_type) {
      queryBuilder.andWhere(
        'transaction.transaction_type = :transaction_type',
        {
          transaction_type,
        },
      );
    }

    if (start_date) {
      queryBuilder.andWhere('transaction.transaction_date >= :start_date', {
        start_date,
      });
    }

    if (end_date) {
      queryBuilder.andWhere('transaction.transaction_date <= :end_date', {
        end_date,
      });
    }

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return {
      transactions,
      item: {
        id: item.id,
        item_name: item.item_name,
        current_stock: item.current_stock,
        unit_of_measurement: item.unit_of_measurement,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Analytics & Reports

  async getLowStockItems(userId: string): Promise<InventoryItem[]> {
    return this.inventoryRepository
      .find({
        where: {
          user_id: userId,
        },
        relations: ['category'],
        order: { item_name: 'ASC' },
      })
      .then((items) =>
        items.filter((item) => item.current_stock <= item.minimum_stock_level),
      );
  }

  async getExpiringItems(
    userId: string,
    daysAhead: number = 30,
  ): Promise<InventoryItem[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.inventoryRepository.find({
      where: {
        user_id: userId,
        expiry_date: LessThanOrEqual(futureDate),
      },
      relations: ['category'],
      order: { expiry_date: 'ASC' },
    });
  }

  async getInventorySummary(userId: string) {
    const items = await this.inventoryRepository.find({
      where: { user_id: userId },
      relations: ['category'],
    });

    const totalItems = items.length;
    const totalValue = items.reduce(
      (sum, item) => sum + item.current_stock * (item.cost_per_unit || 0),
      0,
    );

    const byStatus = {
      in_stock: items.filter((i) => i.status === 'in_stock').length,
      low_stock: items.filter((i) => i.status === 'low_stock').length,
      out_of_stock: items.filter((i) => i.status === 'out_of_stock').length,
      discontinued: items.filter((i) => i.status === 'discontinued').length,
    };

    const byCategory = items.reduce(
      (acc, item) => {
        const categoryName = item.category?.name || 'Uncategorized';
        if (!acc[categoryName]) {
          acc[categoryName] = 0;
        }
        acc[categoryName]++;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total_items: totalItems,
      total_value: totalValue,
      by_status: byStatus,
      by_category: byCategory,
    };
  }

  private determineStatus(currentStock: number, minimumStock: number): string {
    if (currentStock <= 0) {
      return 'out_of_stock';
    } else if (currentStock <= minimumStock) {
      return 'low_stock';
    } else {
      return 'in_stock';
    }
  }
}
