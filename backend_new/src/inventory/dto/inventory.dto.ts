// create-category.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsBoolean,  IsNumber, IsUUID, IsDateString, Min, IsObject, IsEnum, IsInt, Max, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Feed' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Category description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

// update-category.dto.ts
export class UpdateCategoryDto {
  @ApiProperty({ description: 'Category name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Category description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Is category active', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// create-inventory-item.dto.ts
export class CreateInventoryItemDto {
  @ApiProperty({ description: 'Category ID' })
  @IsUUID()
  @IsNotEmpty()
  category_id: string;

  @ApiProperty({ description: 'Farm ID', required: false })
  @IsOptional()
  @IsUUID()
  farm_id?: string;

  @ApiProperty({ description: 'Item name', example: 'Layer Feed' })
  @IsString()
  @IsNotEmpty()
  item_name: string;

  @ApiProperty({ description: 'Item code/SKU', example: 'FEED-001', required: false })
  @IsOptional()
  @IsString()
  item_code?: string;

  @ApiProperty({ description: 'Item description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Unit of measurement', example: 'kg' })
  @IsString()
  @IsNotEmpty()
  unit_of_measurement: string;

  @ApiProperty({ description: 'Current stock quantity', example: 100 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  current_stock: number;

  @ApiProperty({ description: 'Minimum stock level', example: 50 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  minimum_stock_level: number;

  @ApiProperty({ description: 'Reorder point', example: 60, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorder_point?: number;

  @ApiProperty({ description: 'Cost per unit', example: 45.50, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost_per_unit?: number;

  @ApiProperty({ description: 'Supplier name', required: false })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiProperty({ description: 'Supplier contact', required: false })
  @IsOptional()
  @IsString()
  supplier_contact?: string;

  @ApiProperty({ description: 'Storage location', example: 'Warehouse A', required: false })
  @IsOptional()
  @IsString()
  storage_location?: string;

  @ApiProperty({ description: 'Expiry date', example: '2025-12-31', required: false })
  @IsOptional()
  @IsDateString()
  expiry_date?: Date;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    batch_number?: string;
    manufacturer?: string;
    barcode?: string;
  };
}

// update-inventory-item.dto.ts
export class UpdateInventoryItemDto {
  @ApiProperty({ description: 'Category ID', required: false })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ description: 'Farm ID', required: false })
  @IsOptional()
  @IsUUID()
  farm_id?: string;

  @ApiProperty({ description: 'Item name', required: false })
  @IsOptional()
  @IsString()
  item_name?: string;

  @ApiProperty({ description: 'Item code', required: false })
  @IsOptional()
  @IsString()
  item_code?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Unit of measurement', required: false })
  @IsOptional()
  @IsString()
  unit_of_measurement?: string;

  @ApiProperty({ description: 'Minimum stock level', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimum_stock_level?: number;

  @ApiProperty({ description: 'Reorder point', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reorder_point?: number;

  @ApiProperty({ description: 'Cost per unit', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost_per_unit?: number;

  @ApiProperty({ description: 'Supplier', required: false })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiProperty({ description: 'Supplier contact', required: false })
  @IsOptional()
  @IsString()
  supplier_contact?: string;

  @ApiProperty({ description: 'Storage location', required: false })
  @IsOptional()
  @IsString()
  storage_location?: string;

  @ApiProperty({ description: 'Expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiry_date?: Date;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    description: 'Item status', 
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued'])
  status?: string;

  @ApiProperty({ description: 'Metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

// create-transaction.dto.ts
export class CreateTransactionDto {
  @ApiProperty({ 
    description: 'Transaction type',
    enum: ['purchase', 'usage', 'adjustment', 'wastage', 'transfer', 'return']
  })
  @IsEnum(['purchase', 'usage', 'adjustment', 'wastage', 'transfer', 'return'])
  @IsNotEmpty()
  transaction_type: string;

  @ApiProperty({ description: 'Quantity', example: 50 })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Cost per unit', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost_per_unit?: number;

  @ApiProperty({ description: 'Transaction date', example: '2024-11-28' })
  @IsDateString()
  @IsNotEmpty()
  transaction_date: Date;

  @ApiProperty({ description: 'Reference number (invoice, PO)', required: false })
  @IsOptional()
  @IsString()
  reference_number?: string;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Batch ID (if usage)', required: false })
  @IsOptional()
  @IsString()
  batch_id?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    supplier?: string;
    invoice_url?: string;
    approved_by?: string;
  };
}

// query-inventory.dto.ts
export class QueryInventoryDto {
  @ApiProperty({ description: 'Search in item name', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by category ID', required: false })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ description: 'Filter by farm ID', required: false })
  @IsOptional()
  @IsUUID()
  farm_id?: string;

  @ApiProperty({ 
    description: 'Filter by status',
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued'])
  status?: string;

  @ApiProperty({ description: 'Show only low stock items', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  low_stock_only?: boolean;

  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// query-transactions.dto.ts
export class QueryTransactionsDto {
  @ApiProperty({ 
    description: 'Filter by transaction type',
    enum: ['purchase', 'usage', 'adjustment', 'wastage', 'transfer', 'return'],
    required: false 
  })
  @IsOptional()
  @IsEnum(['purchase', 'usage', 'adjustment', 'wastage', 'transfer', 'return'])
  transaction_type?: string;

  @ApiProperty({ description: 'Start date', example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiProperty({ description: 'End date', example: '2024-12-31', required: false })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}