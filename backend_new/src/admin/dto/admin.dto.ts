// admin/dto/query-logs.dto.ts
import { IsOptional, IsInt, Min, Max, IsString, IsObject, IsEmail, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';

export class QueryLogsDto {
  @ApiPropertyOptional({ example: 'device' })
  @IsOptional()
  @IsString()
  entity_type?: string;

  @ApiPropertyOptional({ example: 'update' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

// update-config.dto.ts
export class UpdateConfigDto {
  @ApiProperty({ example: 'payg_daily_rate' })
  @IsString()
  key: string;

  @ApiProperty({ example: '{"amount": 60, "currency": "KES"}' })
  @IsString()
  value: string;

  @ApiProperty()
  @IsObject()
  meta?: Record<string, any>;
}

// createAdmin.dto.ts
export class CreateAdminDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '+254712345678' })
  @IsString()
  phone_number: string;

  @ApiProperty({ example: 'user', default: 'user' })
  @IsString()
  role: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  password: string;
}

// QueryFarmersDto
export class QueryFarmersDto {
  @ApiProperty({ example: 'John Kipchonge'})
  @IsString()
  name: string;

  @ApiProperty({ example: 'example@gmail.com'})
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'location'})
  @IsOptional()
  @IsString()
  location: string;

  @ApiProperty({ example: 4 })
  @IsOptional()
  @IsNumber()
  batches: number

  @ApiProperty({ example: 45})
  @IsOptional()
  @IsNumber()
  brooders: number

  @ApiProperty({ example: 1000 })
  @IsOptional()
  @IsNumber()
  birds: number

  @ApiProperty({ example: 'KES4999' })
  @IsOptional()
  @IsNumber()
  revenue: number

  @ApiProperty({ example: 'active' })
  @IsOptional()
  @IsString()
  status: string

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
