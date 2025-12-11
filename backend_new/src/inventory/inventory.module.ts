// inventory/inventory.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryCategoriesController } from './inventory-categories.controller';
import { InventoryItemsController } from './inventory.controller';
import { InventoryCategoriesService } from './inventory-categories.service';
import { InventoryItemsService } from './inventory-items.service';
import { InventoryCategory } from '../database/entities/InventoryCategory.entity';
import { InventoryItem } from '../database/entities/InventoryItem.entity';
import { InventoryTransaction } from '../database/entities/InventoryTransaction.entity';
import { CustomLogger } from '../common/custom-logger.service';
import { PermissionsGuard } from 'src/auth/guards/permissions.guard';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryCategory,
      InventoryItem,
      InventoryTransaction,
    ]),
    UsersModule,
  ],
  controllers: [InventoryCategoriesController, InventoryItemsController],
  providers: [
    InventoryCategoriesService,
    InventoryItemsService,
    CustomLogger,
    PermissionsGuard,
  ],
  exports: [InventoryCategoriesService, InventoryItemsService],
})
export class InventoryModule {}
