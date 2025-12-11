// batch/dto/update-batch-count.dto.ts
import { IsInt, IsString, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ChangeType {
  MORTALITY = 'mortality',
  SALE = 'sale',
  TRANSFER = 'transfer',
  ADJUSTMENT = 'adjustment',
}

export class UpdateBatchCountDto {
  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(1)
  change_amount: number;

  @ApiProperty({ enum: ChangeType, example: ChangeType.MORTALITY })
  @IsEnum(ChangeType)
  change_type: ChangeType;

  @ApiProperty({ example: 'Disease outbreak' })
  @IsString()
  reason: string;
}
