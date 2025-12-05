// dto/subscription/create-subscription-plan.dto.ts
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsInt,
  IsObject,
  Min,
  Max,
  ValidateNested,
  IsUUID,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

enum PlanType {
  PAYG = 'payg',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  CUSTOM = 'custom',
}

class FeaturesDto {
  @IsOptional()
  @IsBoolean()
  real_time_monitoring?: boolean;

  @IsOptional()
  @IsInt()
  historical_data_days?: number;

  @IsOptional()
  @IsBoolean()
  sms_alerts?: boolean;

  @IsOptional()
  @IsBoolean()
  email_alerts?: boolean;

  @IsOptional()
  @IsBoolean()
  push_notifications?: boolean;

  @IsOptional()
  @IsBoolean()
  api_access?: boolean;

  @IsOptional()
  @IsBoolean()
  advanced_analytics?: boolean;

  @IsOptional()
  @IsBoolean()
  custom_reports?: boolean;

  @IsOptional()
  @IsBoolean()
  priority_support?: boolean;
}

class MetadataDto {
  @IsOptional()
  @IsBoolean()
  recommended?: boolean;

  @IsOptional()
  @IsBoolean()
  popular?: boolean;

  @IsOptional()
  @IsInt()
  trial_days?: number;

  @IsOptional()
  @IsInt()
  minimum_commitment_months?: number;
}

export class CreateSubscriptionPlanDto {
  @IsString()
  name: string;

  @IsEnum(PlanType)
  plan_type: PlanType;

  @IsOptional()
  @IsString()
  description?: string;

  // PAYG Pricing
  @IsOptional()
  @IsNumber()
  @Min(0)
  base_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  per_reading_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  per_alert_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  per_device_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  per_kb_fee?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  free_readings_per_month?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  free_alerts_per_month?: number;

  // Fixed pricing
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthly_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quarterly_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annual_price?: number;

  // Limits
  @IsOptional()
  @IsInt()
  @Min(1)
  max_devices?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  max_readings_per_day?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  max_alerts_per_day?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  max_data_per_month_kb?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FeaturesDto)
  features?: FeaturesDto;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsInt()
  sort_order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;
}

// dto/subscription/create-subscription.dto.ts
export class CreateSubscriptionDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  plan_id: string;

  @IsDateString()
  start_date: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsBoolean()
  auto_renew?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  initial_balance?: number; // For PAYG plans

  @IsOptional()
  @IsBoolean()
  auto_topup_enabled?: boolean;

  @IsOptional()
  @IsNumber()
  auto_topup_amount?: number;

  @IsOptional()
  @IsNumber()
  auto_topup_trigger?: number;

  @IsOptional()
  @IsNumber()
  low_balance_threshold?: number;

  @IsOptional()
  @IsInt()
  custom_max_devices?: number;

  @IsOptional()
  @IsString()
  discount_code?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  trial_days?: number;
}

// dto/subscription/topup-balance.dto.ts
export class TopupBalanceDto {
  @IsUUID()
  subscription_id: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  payment_method: string; // mpesa, card, bank

  @IsOptional()
  @IsString()
  phone_number?: string; // For M-Pesa

  @IsOptional()
  @IsString()
  reference?: string;
}

// dto/subscription/record-usage.dto.ts
export class RecordUsageDto {
  @IsUUID()
  subscription_id: string;

  @IsOptional()
  @IsUUID()
  device_id?: string;

  @IsString()
  usage_type: string; // reading, alert, data_transfer, device_day

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsInt()
  data_size_kb?: number;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

// dto/subscription/query-subscription.dto.ts
export class QuerySubscriptionDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsUUID()
  plan_id?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  auto_renew?: boolean;

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

// dto/subscription/usage-report.dto.ts
export class UsageReportDto {
  @IsUUID()
  subscription_id: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsString()
  group_by?: string; // day, week, month, device, type
}

// dto/subscription/update-subscription-plan.dto.ts
export class UpdateSubscriptionPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(PlanType)
  plan_type?: PlanType;

  @IsOptional()
  @IsString()
  description?: string;

  // PAYG Pricing
  @IsOptional()
  @IsNumber()
  @Min(0)
  base_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  per_reading_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  per_alert_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  per_device_fee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  per_kb_fee?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  free_readings_per_month?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  free_alerts_per_month?: number;

  // Fixed pricing
  @IsOptional()
  @IsNumber()
  @Min(0)
  monthly_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quarterly_price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annual_price?: number;

  // Limits
  @IsOptional()
  @IsInt()
  @Min(1)
  max_devices?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  max_readings_per_day?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  max_alerts_per_day?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  max_data_per_month_kb?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FeaturesDto)
  features?: FeaturesDto;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_public?: boolean;

  @IsOptional()
  @IsInt()
  sort_order?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;
}
