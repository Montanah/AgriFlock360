// batch/dto/create-batch.dto.ts
import {
  IsString,
  IsEnum,
  IsInt,
  IsOptional,
  IsUUID,
  IsDateString,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateBatchDto {
  @ApiProperty({ example: 'Batch 2024-01' })
  @IsString()
  @MaxLength(255)
  batch_name: string;

  @ApiProperty({ example: 'uuid-of-bird-type' })
  @IsUUID()
  bird_type_id: string;

  @ApiProperty({ example: 1000 })
  @IsInt()
  @Min(1)
  initial_count: number;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  hatch_date?: string;

  @ApiPropertyOptional({ example: 'uuid-of-device' })
  @IsOptional()
  @IsUUID()
  device_id?: string;

  @ApiPropertyOptional({ example: 'uuid-of-farm' })
  @IsOptional()
  @IsUUID()
  farm_id?: string;

  @ApiPropertyOptional({ example: 'Kuroiler' })
  @IsOptional()
  @IsString()
  breed?: string;

  @ApiPropertyOptional({ example: '2024-03-15' })
  @IsOptional()
  @IsDateString()
  expected_end_date?: string;

  @ApiPropertyOptional({ example: 'Started with healthy chicks' })
  @IsOptional()
  @IsString()
  notes?: string;
}
