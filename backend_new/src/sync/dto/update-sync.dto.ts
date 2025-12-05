import { IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { SyncStatus } from '../entities/sync.entity';
import { CreateSyncDto } from './create-sync.dto';

export class UpdateSyncDto extends PartialType(CreateSyncDto) {
  @IsOptional()
  @IsEnum(SyncStatus)
  status?: SyncStatus;

  @IsOptional()
  @IsString()
  server_entity_id?: string;

  @IsOptional()
  @IsString()
  conflict_reason?: string;

  @IsOptional()
  @IsNumber()
  server_version?: number;
}
