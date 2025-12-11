// notifications/dto/query-notifications.dto.ts
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';

export class QueryNotificationsDto {
  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_read?: boolean;

  @ApiPropertyOptional({ example: 'alert' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// notifications/dto/create-notification.dto.ts

export enum NotificationType {
  INFO = 'info',
  REMINDER = 'reminder',
  DEADLINE = 'deadline',
  WARNING = 'warning',
}

export class CreateNotificationDto {
  @ApiProperty({ example: 'Payment Successful' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Your payment of KES 500 has been processed',
  })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiProperty({ enum: NotificationType, example: NotificationType.INFO })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiPropertyOptional({ example: 'payment' })
  @IsOptional()
  @IsString()
  entity_type?: string;

  @ApiPropertyOptional({ example: 'payment-uuid' })
  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @ApiPropertyOptional({ example: 'email' })
  @IsOptional()
  @IsString()
  delivery_channel?: string;
}
