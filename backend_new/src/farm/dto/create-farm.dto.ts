// farm/dto/create-farm.dto.ts
import { IsString, IsOptional, IsNumber, IsObject, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFarmDto {
  @ApiProperty({ example: 'Green Valley Farm' })
  @IsString()
  @MaxLength(255)
  farm_name: string;

  @ApiPropertyOptional({ example: 'Nairobi, Kenya' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ example: 50.5 })
  @IsOptional()
  @IsNumber()
  total_area?: number;

  @ApiPropertyOptional({ example: 'poultry' })
  @IsOptional()
  @IsString()
  farm_type?: string;

  @ApiPropertyOptional({ example: 'Main poultry farm' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  gps_coordinates?: {
    latitude?: number;
    longitude?: number;
  };

  
}