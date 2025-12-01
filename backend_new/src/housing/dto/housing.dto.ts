//create-material.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, IsObject, IsUUID, IsInt, Max  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateMaterialDto {
  @ApiProperty({ description: 'Material name', example: 'Roofing Sheets 32 gauge 10ft' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Category', 
    example: 'roofing',
    enum: ['roofing', 'walls', 'fencing', 'fixtures', 'construction', 'labor'],
    required: false 
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Unit of measurement', example: 'pcs' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiProperty({ description: 'Unit price', example: 740 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  unit_price: number;

  @ApiProperty({ description: 'Currency', example: 'KES', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Supplier name', required: false })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiProperty({ description: 'Specifications', example: '32 gauge 10ft', required: false })
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiProperty({ description: 'Display order', required: false })
  @IsOptional()
  @IsNumber()
  display_order?: number;

  @ApiProperty({ description: 'Metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    alternatives?: string[];
    notes?: string[];
  };
}

// update-material.dto.ts
export class UpdateMaterialDto {
  @ApiProperty({ description: 'Material name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Unit', required: false })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiProperty({ description: 'Unit price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unit_price?: number;

  @ApiProperty({ description: 'Currency', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Supplier', required: false })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiProperty({ description: 'Specifications', required: false })
  @IsOptional()
  @IsString()
  specifications?: string;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ description: 'Display order', required: false })
  @IsOptional()
  @IsNumber()
  display_order?: number;

  @ApiProperty({ description: 'Metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

// create-quantity.dto.ts
export class CreateQuantityDto {
  @ApiProperty({ description: 'Material ID' })
  @IsUUID()
  @IsNotEmpty()
  material_id: string;

  @ApiProperty({ description: 'Bird capacity', example: 500 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  bird_capacity: number;

  @ApiProperty({ description: 'Quantity needed', example: 24 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  quantity_needed: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

// update-quantity.dto.ts
export class UpdateQuantityDto {
  @ApiProperty({ description: 'Bird capacity', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  bird_capacity?: number;

  @ApiProperty({ description: 'Quantity needed', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity_needed?: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// housing/dto/generate-quotation.dto.ts
export class GenerateQuotationDto {
  @ApiProperty({ description: 'Bird capacity for housing', example: 500 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  bird_capacity: number;

  @ApiProperty({ description: 'Labor percentage', example: 26, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  labor_percentage?: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Project metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    location?: string;
    project_name?: string;
    contractor?: string;
  };
}

// query-materials.dto.ts
export class QueryMaterialsDto {
  @ApiProperty({ description: 'Search in name', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by category', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ description: 'Show only active', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  active_only?: boolean;

  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', default: 50, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}