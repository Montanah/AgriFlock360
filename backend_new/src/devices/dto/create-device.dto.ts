import { IsString, IsUUID, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum DeviceType {
  SMART_BROODER = 'smart_brooder',
}

export class CreateDeviceDto {
  @ApiProperty({ example: 'ABC123XYZ456' })
  @IsString()
  @MaxLength(50)
  device_id: string;

  @ApiProperty({ example: 'Brooder Unit 1' })
  @IsString()
  @MaxLength(255)
  device_name: string;

  @ApiProperty({ enum: DeviceType, example: DeviceType.SMART_BROODER })
  @IsEnum(DeviceType)
  device_type: DeviceType;

  @ApiPropertyOptional({ example: 'uuid-of-owner' })
  @IsOptional()
  @IsUUID()
  owner_id?: string;

  @ApiPropertyOptional({ example: 'Nairobi Farm - Section A' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ example: 'Initial setup notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
