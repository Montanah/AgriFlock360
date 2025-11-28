// uploads/dto/upload-file.dto.ts
import { IsString, IsOptional, IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum FileCategory {
  AVATAR = 'avatar',
  DOCUMENT = 'document',
  FIRMWARE = 'firmware',
  REPORT = 'report',
  IMAGE = 'image',
  VIDEO = 'video',
  OTHER = 'other',
}

export class UploadFileDto {
  @ApiPropertyOptional({ enum: FileCategory, example: FileCategory.AVATAR })
  @IsOptional()
  @IsEnum(FileCategory)
  category?: FileCategory;

  @ApiPropertyOptional({ example: 'user' })
  @IsOptional()
  @IsString()
  entity_type?: string;

  @ApiPropertyOptional({ example: 'user-uuid' })
  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}