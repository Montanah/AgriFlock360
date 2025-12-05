// create-feeding-recommendation.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsObject,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeedingRecommendationDto {
  @ApiProperty({ description: 'Bird type ID' })
  @IsUUID()
  @IsNotEmpty()
  bird_type_id: string;

  @ApiProperty({ description: 'Growth stage name', example: 'Starter' })
  @IsString()
  @IsNotEmpty()
  stage_name: string;

  @ApiProperty({ description: 'Age start in days', example: 0 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  age_start: number;

  @ApiProperty({ description: 'Age end in days', example: 14 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  age_end: number;

  @ApiProperty({ description: 'Feed type', example: 'Starter mash' })
  @IsString()
  @IsNotEmpty()
  feed_type: string;

  @ApiProperty({ description: 'Protein percentage', example: 22.0 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsNotEmpty()
  protein_percentage: number;

  @ApiProperty({
    description: 'Quantity per bird per day (kg)',
    example: 0.035,
  })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  quantity_per_bird_per_day: number;

  @ApiProperty({
    description: 'Times per day to feed',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  times_per_day?: number;

  @ApiProperty({
    description: 'Feeding time slots',
    example: { slots: ['06:00', '12:00', '18:00'] },
    required: false,
  })
  @IsOptional()
  @IsObject()
  feeding_times?: {
    slots: string[];
  };

  @ApiProperty({ description: 'Special notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Supplements needed',
    example: 'Add calcium for layers',
    required: false,
  })
  @IsOptional()
  @IsString()
  supplements?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    energy_level?: string;
    fiber_percentage?: number;
    calcium_percentage?: number;
    special_requirements?: string[];
  };
}

// update-feeding-recommendation.dto.ts
export class UpdateFeedingRecommendationDto {
  @ApiProperty({ description: 'Bird type ID', required: false })
  @IsOptional()
  @IsUUID()
  bird_type_id?: string;

  @ApiProperty({ description: 'Stage name', required: false })
  @IsOptional()
  @IsString()
  stage_name?: string;

  @ApiProperty({ description: 'Age start', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  age_start?: number;

  @ApiProperty({ description: 'Age end', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  age_end?: number;

  @ApiProperty({ description: 'Feed type', required: false })
  @IsOptional()
  @IsString()
  feed_type?: string;

  @ApiProperty({ description: 'Protein percentage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  protein_percentage?: number;

  @ApiProperty({ description: 'Quantity per bird per day', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity_per_bird_per_day?: number;

  @ApiProperty({ description: 'Times per day', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  times_per_day?: number;

  @ApiProperty({ description: 'Feeding times', required: false })
  @IsOptional()
  @IsObject()
  feeding_times?: {
    slots: string[];
  };

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Supplements', required: false })
  @IsOptional()
  @IsString()
  supplements?: string;

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ description: 'Metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

// query-recommendations.dto.ts
export class QueryRecommendationsDto {
  @ApiProperty({ description: 'Filter by bird type ID', required: false })
  @IsOptional()
  @IsUUID()
  bird_type_id?: string;

  @ApiProperty({ description: 'Filter by stage name', required: false })
  @IsOptional()
  @IsString()
  stage_name?: string;

  @ApiProperty({ description: 'Filter by bird age (days)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  age?: number;

  @ApiProperty({ description: 'Show only active', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  active_only?: boolean;

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

// create-feeding-record.dto.ts
export class CreateFeedingRecordDto {
  @ApiProperty({
    description: 'Schedule ID (if from schedule)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  schedule_id?: string;

  @ApiProperty({ description: 'Age of birds in days', example: 10 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  age: number;

  @ApiProperty({ description: 'Feed type', example: 'Starter mash' })
  @IsString()
  @IsNotEmpty()
  feed_type: string;

  @ApiProperty({ description: 'Quantity in kg', example: 25.5 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Cost', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost?: number;

  @ApiProperty({ description: 'Supplier name', required: false })
  @IsOptional()
  @IsString()
  supplier?: string;

  @ApiProperty({
    description: 'Fed at timestamp',
    example: '2024-11-28T06:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  fed_at?: Date;

  @ApiProperty({ description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
