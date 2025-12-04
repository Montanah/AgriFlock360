// dto/extension-officer/create-extension-officer.dto.ts
import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsOptional,
  IsInt,
  IsEnum,
  IsBoolean,
  IsArray,
  IsDateString,
  MaxLength,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

enum OfficerType {
  VET = 'vet',
  FIELD_OFFICER = 'field_officer',
  EXTENSION_WORKER = 'extension_worker',
}

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

enum OfficerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

class SpecializationsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  areas?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certifications?: string[];
}

class CoverageAreasDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  counties?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sub_counties?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  wards?: string[];
}

class ContactInfoDto {
  @IsOptional()
  @IsString()
  alternative_phone?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsString()
  emergency_contact?: string;
}

class MetadataDto {
  @IsOptional()
  @IsString()
  employer?: string;

  @IsOptional()
  @IsString()
  organization?: string;

  @IsOptional()
  @IsString()
  employee_id?: string;
}

export class CreateExtensionOfficerDto {
  @IsString()
  name: string;

  @IsEnum(OfficerType)
  officer_type: OfficerType;

  @IsEmail()
  email: string;

  @IsPhoneNumber('KE')
  phone_number: string;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(100)
  age?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsInt()
  @Min(0)
  years_of_experience?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  profile_bio?: string;

  @IsOptional()
  @IsString()
  id_photo_url?: string;

  @IsOptional()
  @IsString()
  face_selfie_url?: string;

  @IsOptional()
  @IsString()
  certificate_url?: string;

  @IsOptional()
  @IsString()
  additional_certificate_url?: string;

  @IsOptional()
  @IsString()
  license_number?: string;

  @IsOptional()
  @IsDateString()
  license_expiry_date?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpecializationsDto)
  specializations?: SpecializationsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoverageAreasDto)
  coverage_areas?: CoverageAreasDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contact_info?: ContactInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;
}

// dto/extension-officer/update-extension-officer.dto.ts
import { PartialType } from '@nestjs/mapped-types';

export class UpdateExtensionOfficerDto extends PartialType(
  CreateExtensionOfficerDto,
) {
  @IsOptional()
  @IsEnum(OfficerStatus)
  status?: OfficerStatus;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}

// dto/extension-officer/query-extension-officer.dto.ts
export class QueryExtensionOfficerDto {
  @IsOptional()
  @IsEnum(OfficerType)
  officer_type?: OfficerType;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsEnum(OfficerStatus)
  status?: OfficerStatus;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}