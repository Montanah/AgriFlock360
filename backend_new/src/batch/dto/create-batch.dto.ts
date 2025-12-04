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

  @ApiProperty({ example: 'Egg Production' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  batch_type: string;

  @ApiProperty({ example: 1000 })
  @IsOptional()
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
  
  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  age?: number;

  @ApiPropertyOptional({ description: 'Number of alive birds', example: 2 })
  @IsOptional()
  @IsInt()
  @Min(1)
  birds_alive: number;
  
  @ApiPropertyOptional({ description: 'Current weight in grams', example: 2 })
  @IsOptional()
  @IsInt()
  current_weight: number;
  
  @ApiPropertyOptional({ description: 'Expected weight in grams', example: 2 })
  @IsOptional()
  @IsInt()
  expected_weight: number;
  
  @ApiPropertyOptional({ description: 'Feeding time', example: 'Day' })
  @IsOptional()
  @IsString()
  feeding_time: string;
  
  @ApiPropertyOptional({ description: 'Feeding schedule', example: ['08:00', '12:00', '16:00'] })
  @IsOptional()
  @IsString({ each: true })
  feeding_schedule: string[];

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
