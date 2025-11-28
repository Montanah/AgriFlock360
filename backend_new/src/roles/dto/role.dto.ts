// roles/dto/create-role.dto.ts
import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsArray, IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name', example: 'farm_manager' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Role description', example: 'Manages farm operations', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Permission IDs to assign', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  permission_ids?: string[];
}

// roles/dto/update-role.dto.ts
export class UpdateRoleDto {
  @ApiProperty({ description: 'Role name', example: 'farm_manager', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Role description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Is role active', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// roles/dto/query-roles.dto.ts
export class QueryRolesDto {
  @ApiProperty({ description: 'Search in name or description', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filter by active status', required: false })
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