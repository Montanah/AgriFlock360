// dto/field-appraisal/create-field-appraisal.dto.ts
import {
  IsString,
  IsUUID,
  IsOptional,
  IsInt,
  IsBoolean,
  IsDateString,
  IsObject,
  IsArray,
  IsEnum,
  ValidateNested,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

enum VisitPurpose {
  INSPECTION = 'inspection',
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
}

enum AppraisalStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REQUIRES_FOLLOW_UP = 'requires_follow_up',
}

enum FraudSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

class FraudIndicatorsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  suspicious_activities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  red_flags?: string[];

  @IsOptional()
  @IsEnum(FraudSeverity)
  severity?: FraudSeverity;
}

class PhotosDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  house_exterior?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  house_interior?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brooder?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  feeders?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  drinkers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  water_source?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  feed_store?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  risks_identified?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  general?: string[];
}

class ChecklistDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  items_checked?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  items_failed?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  improvements_needed?: string[];
}

class RecommendationsGivenDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  immediate?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  short_term?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  long_term?: string[];
}

class MetadataDto {
  @IsOptional()
  @IsString()
  weather_conditions?: string;

  @IsOptional()
  @IsInt()
  time_spent_minutes?: number;

  @IsOptional()
  @IsUUID()
  previous_visit_id?: string;
}

export class CreateFieldAppraisalDto {
  @IsUUID()
  officer_id: string;

  @IsUUID()
  farmer_id: string;

  @IsOptional()
  @IsUUID()
  farm_id?: string;

  @IsDateString()
  visit_date: string;

  @IsOptional()
  @IsEnum(VisitPurpose)
  visit_purpose?: VisitPurpose;

  // GPS Location
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsString()
  location_name?: string;

  // Structure Assessment (0-10 each)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  structure_integrity_score?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  ventilation_score?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  hygiene_score?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  biosecurity_score?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  feed_storage_score?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  water_reliability_score?: number;

  // Equipment Verification
  @IsOptional()
  @IsBoolean()
  brooder_verified?: boolean;

  @IsOptional()
  @IsString()
  brooder_condition?: string;

  @IsOptional()
  @IsBoolean()
  feeders_verified?: boolean;

  @IsOptional()
  @IsString()
  feeders_condition?: string;

  @IsOptional()
  @IsBoolean()
  drinkers_verified?: boolean;

  @IsOptional()
  @IsString()
  drinkers_condition?: string;

  // Farmer Assessment
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  farmer_knowledge_score?: number;

  @IsOptional()
  @IsString()
  farmer_knowledge_notes?: string;

  // Buyer Verification
  @IsOptional()
  @IsBoolean()
  buyer_verified?: boolean;

  @IsOptional()
  @IsString()
  buyer_name?: string;

  @IsOptional()
  @IsString()
  buyer_contact?: string;

  // Fraud Flags
  @IsOptional()
  @IsBoolean()
  fraud_flag_raised?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => FraudIndicatorsDto)
  fraud_indicators?: FraudIndicatorsDto;

  // Photos
  @IsOptional()
  @ValidateNested()
  @Type(() => PhotosDto)
  photos?: PhotosDto;

  // Overall Assessment
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  overall_score?: number;

  @IsString()
  recommendation: string;

  @IsOptional()
  @IsString()
  observations?: string;

  @IsOptional()
  @IsString()
  action_items?: string;

  @IsOptional()
  @IsDateString()
  follow_up_date?: string;

  @IsOptional()
  @IsEnum(AppraisalStatus)
  status?: AppraisalStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => ChecklistDto)
  checklist?: ChecklistDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => RecommendationsGivenDto)
  recommendations_given?: RecommendationsGivenDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;
}

// dto/field-appraisal/update-field-appraisal.dto.ts
import { PartialType } from '@nestjs/mapped-types';

export class UpdateFieldAppraisalDto extends PartialType(
  CreateFieldAppraisalDto,
) {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  farmer_rating?: number;

  @IsOptional()
  @IsString()
  farmer_feedback?: string;
}

// dto/field-appraisal/query-field-appraisal.dto.ts
export class QueryFieldAppraisalDto {
  @IsOptional()
  @IsUUID()
  officer_id?: string;

  @IsOptional()
  @IsUUID()
  farmer_id?: string;

  @IsOptional()
  @IsUUID()
  farm_id?: string;

  @IsOptional()
  @IsEnum(AppraisalStatus)
  status?: AppraisalStatus;

  @IsOptional()
  @IsBoolean()
  fraud_flag_raised?: boolean;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}