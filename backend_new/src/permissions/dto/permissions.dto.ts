// roles/dto/assign-permissions.dto.ts
import { IsArray, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class AssignPermissionsDto {
  @ApiProperty({ description: 'Permission IDs to assign', type: [String] })
  @IsArray()
  @IsNotEmpty()
  @IsUUID('4', { each: true })
  permission_ids: string[];
}

// permissions/dto/create-permission.dto.ts
export class CreatePermissionDto {
  @ApiProperty({
    description: 'Permission name (e.g., users.create)',
    example: 'users.create',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Permission description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Module name (e.g., users, devices)',
    example: 'users',
    required: false,
  })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiProperty({
    description: 'Action name (e.g., create, read, update, delete)',
    example: 'create',
    required: false,
  })
  @IsOptional()
  @IsString()
  action?: string;
}

// permissions/dto/update-permission.dto.ts
export class UpdatePermissionDto {
  @ApiProperty({ description: 'Permission name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Permission description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Module name', required: false })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiProperty({ description: 'Action name', required: false })
  @IsOptional()
  @IsString()
  action?: string;
}

// permissions/dto/query-permissions.dto.ts
export class QueryPermissionsDto {
  @ApiProperty({ description: 'Filter by module', required: false })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiProperty({ description: 'Filter by action', required: false })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiProperty({
    description: 'Search in name or description',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

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
