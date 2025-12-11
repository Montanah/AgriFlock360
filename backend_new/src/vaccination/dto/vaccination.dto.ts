// create-vaccine.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  IsObject,
  IsInt,
  Max,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateVaccineDto {
  @ApiProperty({
    description: 'Vaccine name',
    example: 'Newcastle Disease Vaccine',
  })
  @IsString()
  @IsNotEmpty()
  vaccine_name: string;

  @ApiProperty({
    description: 'Vaccine type',
    example: 'viral',
    enum: ['viral', 'bacterial', 'protozoan', 'fungal', 'other'],
  })
  @IsString()
  @IsNotEmpty()
  vaccine_type: string;

  @ApiProperty({ description: 'Detailed description of the vaccine' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Manufacturer name', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ description: 'Brand/commercial name', required: false })
  @IsOptional()
  @IsString()
  brand_name?: string;

  @ApiProperty({
    description: 'Minimum recommended age in days',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  recommended_age_min?: number;

  @ApiProperty({
    description: 'Maximum recommended age in days',
    example: 7,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  recommended_age_max?: number;

  @ApiProperty({
    description: 'Recommended age description',
    example: 'Day 1-7 or Week 2-3',
    required: false,
  })
  @IsOptional()
  @IsString()
  recommended_age_description?: string;

  @ApiProperty({ description: 'Dosage per bird', example: '0.03ml per bird' })
  @IsString()
  @IsNotEmpty()
  dosage: string;

  @ApiProperty({
    description: 'Method of administration',
    example: 'injection',
    enum: ['injection', 'drinking_water', 'eye_drop', 'spray', 'feed', 'other'],
  })
  @IsString()
  @IsNotEmpty()
  administration_method: string;

  @ApiProperty({ description: 'Detailed usage instructions', required: false })
  @IsOptional()
  @IsString()
  usage_instructions?: string;

  @ApiProperty({ description: 'Precautions and warnings', required: false })
  @IsOptional()
  @IsString()
  precautions?: string;

  @ApiProperty({ description: 'Known side effects', required: false })
  @IsOptional()
  @IsString()
  side_effects?: string;

  @ApiProperty({
    description: 'Withdrawal period in days',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  withdrawal_period_days?: number;

  @ApiProperty({
    description: 'Storage conditions',
    example: '2-8°C',
    required: false,
  })
  @IsOptional()
  @IsString()
  storage_conditions?: string;

  @ApiProperty({
    description: 'Estimated cost per dose',
    example: 0.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_cost_per_dose?: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'KES',
    required: false,
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({
    description: 'Target disease',
    example: 'Newcastle Disease',
    required: false,
  })
  @IsOptional()
  @IsString()
  target_disease?: string;

  @ApiProperty({
    description: 'Target bird type',
    example: 'all',
    enum: ['layers', 'broilers', 'all'],
    required: false,
  })
  @IsOptional()
  @IsString()
  bird_type?: string;

  @ApiProperty({
    description: 'Mark as recommended vaccine',
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_recommended?: boolean;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    keywords?: string[];
    links?: string[];
    documents?: string[];
  };
}

// update-vaccine.dto.ts
export class UpdateVaccineDto {
  @ApiProperty({ description: 'Vaccine name', required: false })
  @IsOptional()
  @IsString()
  vaccine_name?: string;

  @ApiProperty({ description: 'Vaccine type', required: false })
  @IsOptional()
  @IsString()
  vaccine_type?: string;

  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Manufacturer', required: false })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ description: 'Brand name', required: false })
  @IsOptional()
  @IsString()
  brand_name?: string;

  @ApiProperty({
    description: 'Minimum recommended age in days',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  recommended_age_min?: number;

  @ApiProperty({
    description: 'Maximum recommended age in days',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  recommended_age_max?: number;

  @ApiProperty({ description: 'Recommended age description', required: false })
  @IsOptional()
  @IsString()
  recommended_age_description?: string;

  @ApiProperty({ description: 'Dosage', required: false })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiProperty({ description: 'Administration method', required: false })
  @IsOptional()
  @IsString()
  administration_method?: string;

  @ApiProperty({ description: 'Usage instructions', required: false })
  @IsOptional()
  @IsString()
  usage_instructions?: string;

  @ApiProperty({ description: 'Precautions', required: false })
  @IsOptional()
  @IsString()
  precautions?: string;

  @ApiProperty({ description: 'Side effects', required: false })
  @IsOptional()
  @IsString()
  side_effects?: string;

  @ApiProperty({ description: 'Withdrawal period', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  withdrawal_period_days?: number;

  @ApiProperty({ description: 'Storage conditions', required: false })
  @IsOptional()
  @IsString()
  storage_conditions?: string;

  @ApiProperty({ description: 'Cost per dose', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimated_cost_per_dose?: number;

  @ApiProperty({ description: 'Currency', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Target disease', required: false })
  @IsOptional()
  @IsString()
  target_disease?: string;

  @ApiProperty({ description: 'Bird type', required: false })
  @IsOptional()
  @IsString()
  bird_type?: string;

  @ApiProperty({ description: 'Is recommended', required: false })
  @IsOptional()
  @IsBoolean()
  is_recommended?: boolean;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ description: 'Metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    keywords?: string[];
    links?: string[];
    documents?: string[];
  };
}

// query-vaccines.dto.ts
export class QueryVaccinesDto {
  @ApiProperty({
    description: 'Search in name, description, or disease',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by vaccine type', required: false })
  @IsOptional()
  @IsString()
  vaccine_type?: string;

  @ApiProperty({ description: 'Filter by bird type', required: false })
  @IsOptional()
  @IsString()
  bird_type?: string;

  @ApiProperty({ description: 'Filter by target disease', required: false })
  @IsOptional()
  @IsString()
  target_disease?: string;

  @ApiProperty({
    description: 'Show only recommended vaccines',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_recommended?: boolean;

  @ApiProperty({ description: 'Show only active vaccines', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ description: 'Page number', default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// vaccinations/dto/create-vaccination.dto.ts
export class CreateVaccinationDto {
  @ApiProperty({
    description: 'Vaccine catalog ID (if using recommended vaccine)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  vaccine_catalog_id?: string;

  @ApiProperty({ description: 'Vaccine name (required if not using catalog)' })
  @IsString()
  @IsNotEmpty()
  vaccine_name: string;

  @ApiProperty({ description: 'Vaccine type', required: false })
  @IsOptional()
  @IsString()
  vaccine_type?: string;

  @ApiProperty({ description: 'Scheduled date', example: '2024-12-01' })
  @IsDateString()
  @IsNotEmpty()
  scheduled_date: Date;

  @ApiProperty({ description: 'Dosage', required: false })
  @IsOptional()
  @IsString()
  dosage?: string;

  @ApiProperty({ description: 'Administration method', required: false })
  @IsOptional()
  @IsString()
  administration_method?: string;

  @ApiProperty({ description: 'Cost', required: false })
  @IsOptional()
  @IsNumber()
  cost?: number;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Source of vaccination',
    enum: ['catalog', 'manual'],
    default: 'manual',
    required: false,
  })
  @IsOptional()
  @IsEnum(['catalog', 'manual'])
  source?: string;
}

// vaccinations/dto/complete-vaccination.dto.ts
export class CompleteVaccinationDto {
  @ApiProperty({
    description: 'Name/title of person who administered',
    example: 'Dr. John Kamau',
  })
  @IsString()
  @IsNotEmpty()
  administered_by: string;

  @ApiProperty({ description: 'Number of birds vaccinated', example: 500 })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  birds_vaccinated: number;

  @ApiProperty({ description: 'Actual cost incurred', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiProperty({
    description: 'Additional notes or observations',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
