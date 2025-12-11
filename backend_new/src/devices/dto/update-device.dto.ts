import { IsString, IsOptional, MaxLength, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDeviceDto {
  @ApiPropertyOptional({ example: 'Updated Brooder Name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  device_name?: string;

  @ApiPropertyOptional({ example: 'New Location' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ example: 'uuid-of-status' })
  @IsOptional()
  @IsUUID()
  device_status_id?: string;

  @ApiPropertyOptional({ example: 'MyWiFi' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  wifi_ssid?: string;

  @ApiPropertyOptional({ example: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
