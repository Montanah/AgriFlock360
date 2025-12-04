// inventory/inventory-items.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InventoryItemsService } from './inventory-items.service';
import { CreateInventoryItemDto, UpdateInventoryItemDto, CreateTransactionDto, QueryInventoryDto, QueryTransactionsDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Inventory Items')
@Controller('inventory/items')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryItemsController {
  constructor(private readonly inventoryService: InventoryItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Add new inventory item' })
  @ApiResponse({ status: 201, description: 'Item added successfully' })
  async createItem(
    @Body() createDto: CreateInventoryItemDto,
    @CurrentUser() user: any,
  ) {
    const item = await this.inventoryService.createItem(user.userId, createDto);

    return {
      success: true,
      message: 'Inventory item added successfully',
      data: item,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory items with filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated items' })
  async getItems(@Query() query: QueryInventoryDto, @CurrentUser() user: any) {
    const result = await this.inventoryService.getItems(user.userId, query);

    return {
      success: true,
      data: result.items,
      pagination: result.pagination,
    };
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  @ApiResponse({ status: 200, description: 'Returns items at or below minimum stock' })
  async getLowStockItems(@CurrentUser() user: any) {
    const items = await this.inventoryService.getLowStockItems(user.userId);

    return {
      success: true,
      data: items,
      count: items.length,
    };
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get items expiring soon' })
  @ApiResponse({ status: 200, description: 'Returns items expiring in next 30 days' })
  async getExpiringItems(
    @Query('days') days: number = 30,
    @CurrentUser() user: any,
  ) {
    const items = await this.inventoryService.getExpiringItems(user.userId, days);

    return {
      success: true,
      data: items,
      count: items.length,
    };
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get inventory summary and analytics' })
  @ApiResponse({ status: 200, description: 'Returns inventory statistics' })
  async getInventorySummary(@CurrentUser() user: any) {
    const summary = await this.inventoryService.getInventorySummary(user.userId);

    return {
      success: true,
      data: summary,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific inventory item' })
  @ApiResponse({ status: 200, description: 'Returns item details' })
  async getItem(@Param('id') id: string, @CurrentUser() user: any) {
    const item = await this.inventoryService.getItem(id, user.userId);

    return {
      success: true,
      data: item,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update inventory item' })
  @ApiResponse({ status: 200, description: 'Item updated successfully' })
  async updateItem(
    @Param('id') id: string,
    @Body() updateDto: UpdateInventoryItemDto,
    @CurrentUser() user: any,
  ) {
    const item = await this.inventoryService.updateItem(id, user.userId, updateDto);

    return {
      success: true,
      message: 'Inventory item updated successfully',
      data: item,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inventory item' })
  @ApiResponse({ status: 204, description: 'Item deleted successfully' })
  async deleteItem(@Param('id') id: string, @CurrentUser() user: any) {
    await this.inventoryService.deleteItem(id, user.userId);
  }

  // Transactions

  @Post(':id/transactions')
  @ApiOperation({ summary: 'Create inventory transaction (purchase, usage, etc.)' })
  @ApiResponse({ status: 201, description: 'Transaction recorded successfully' })
  async createTransaction(
    @Param('id') id: string,
    @Body() createDto: CreateTransactionDto,
    @CurrentUser() user: any,
  ) {
    const transaction = await this.inventoryService.createTransaction(
      id,
      user.userId,
      createDto,
    );

    return {
      success: true,
      message: 'Transaction recorded successfully',
      data: transaction,
    };
  }

  @Get(':id/transactions')
  @ApiOperation({ summary: 'Get item transaction history' })
  @ApiResponse({ status: 200, description: 'Returns paginated transactions' })
  async getItemTransactions(
    @Param('id') id: string,
    @Query() query: QueryTransactionsDto,
    @CurrentUser() user: any,
  ) {
    const result = await this.inventoryService.getItemTransactions(
      id,
      user.userId,
      query,
    );

    return {
      success: true,
      data: result.transactions,
      item: result.item,
      pagination: result.pagination,
    };
  }
}
