// devices/dto/create-firmware.dto.ts
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsNumber,
  IsObject,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReleaseType {
  STABLE = 'stable',
  BETA = 'beta',
  ALPHA = 'alpha',
}

export class CreateFirmwareDto {
  @ApiProperty({ example: '1.2.3' })
  @IsString()
  @Matches(/^\d+\.\d+\.\d+$/, { message: 'Version must be in format X.Y.Z' })
  version: string;

  @ApiProperty({ example: 'smart_brooder' })
  @IsString()
  device_type: string;

  @ApiProperty({ example: 'Added new temperature control features' })
  @IsString()
  description: string;

  @ApiProperty({ example: '- Fixed temperature sensor bug\n- Improved WiFi stability' })
  @IsString()
  changelog: string;

  @ApiProperty({ enum: ReleaseType, example: ReleaseType.STABLE })
  @IsEnum(ReleaseType)
  release_type: ReleaseType;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_mandatory: boolean;

  @ApiPropertyOptional({ example: '1.0.0' })
  @IsOptional()
  @IsString()
  min_version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: {
    features?: string[];
    fixes?: string[];
    breaking_changes?: string[];
    rollout_percentage?: number;
  };
}
