// vaccination/dto/create-vaccination.dto.ts
import {
  IsString,
  IsDateString,
  IsOptional,
  IsInt,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVaccinationDto {
  @ApiProperty({ example: 'Newcastle Disease Vaccine' })
  @IsString()
  vaccine_name: string;

  @ApiPropertyOptional({ example: 'Live virus' })
  @IsOptional()
  @IsString()
  vaccine_type?: string;

  @ApiProperty({ example: '2024-02-01' })
  @IsDateString()
  scheduled_date: string;

  @ApiPropertyOptional({ example: '1ml per bird' })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiPropertyOptional({ example: 1000 })
  @IsOptional()
  @IsInt()
  birds_vaccinated?: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiPropertyOptional({ example: 'First vaccination' })
  @IsOptional()
  @IsString()
  notes?: string;
}
