import { IsEnum, IsNotEmpty, IsUUID, IsOptional, IsString, IsObject } from 'class-validator';
import { OperationType, EntityType } from '../entities/sync.entity';

export class CreateSyncOperationDto {
  @IsNotEmpty()
  @IsString()
  operation_id: string;

  @IsNotEmpty()
  @IsEnum(OperationType)
  operation_type: OperationType;

  @IsNotEmpty()
  @IsEnum(EntityType)
  entity_type: EntityType;

  @IsOptional()
  @IsString()
  entity_id?: string;

  @IsNotEmpty()
  @IsObject()
  operation_data: any;
}

export class CreateSyncDto extends CreateSyncOperationDto {}

export class BatchSyncDto {
  @IsNotEmpty()
  @IsUUID()
  user_id: string;

  @IsNotEmpty()
  operations: CreateSyncOperationDto[];
}
