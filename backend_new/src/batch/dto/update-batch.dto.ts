// batch/dto/update-batch.dto.ts
import {
  IsString,
  IsInt,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BatchStatus } from '../../database/entities/Batch.entity';

export class UpdateBatchDto {
  @ApiPropertyOptional({ example: 'Updated Batch Name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  batch_name?: string;

  @ApiPropertyOptional({ example: 950 })
  @IsOptional()
  @IsInt()
  @Min(0)
  current_count?: number;

  @ApiPropertyOptional({ example: 'uuid-of-device' })
  @IsOptional()
  @IsUUID()
  device_id?: string;

  @ApiPropertyOptional({ enum: BatchStatus })
  @IsOptional()
  @IsEnum(BatchStatus)
  current_status?: BatchStatus;

  @ApiPropertyOptional({ example: 'Updated notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
