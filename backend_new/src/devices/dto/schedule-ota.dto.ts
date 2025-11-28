// devices/dto/schedule-ota.dto.ts
import { IsUUID, IsOptional, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScheduleOtaDto {
  @ApiProperty({ example: 'firmware-uuid' })
  @IsUUID()
  firmware_id: string;

  @ApiPropertyOptional({ example: ['device-uuid-1', 'device-uuid-2'] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  device_ids?: string[];

  @ApiPropertyOptional({ example: '2024-02-01T02:00:00Z' })
  @IsOptional()
  @IsDateString()
  scheduled_at?: string;
}
