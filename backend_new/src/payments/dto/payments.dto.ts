// payments/dto/initiate-payment.dto.ts
import {
  IsNumber,
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  Min,
  Matches,
  IsObject, IsInt, Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethod {
  MPESA = 'mpesa',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentPurpose {
  DEVICE_PURCHASE = 'device_purchase',
  PAYG_TOPUP = 'payg_topup',
  SUBSCRIPTION = 'subscription',
  SERVICE_FEE = 'service_fee',
}

export class InitiatePaymentDto {
  @ApiPropertyOptional({ example: 'device-uuid' })
  @IsOptional()
  @IsUUID()
  device_id?: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.MPESA })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({ example: '254712345678' })
  @IsString()
  @Matches(/^254\d{9}$/, { message: 'Invalid phone number format' })
  phone_number: string;

  @ApiProperty({ enum: PaymentPurpose, example: PaymentPurpose.PAYG_TOPUP })
  @IsEnum(PaymentPurpose)
  purpose: PaymentPurpose;

  @ApiPropertyOptional({ example: 'KES' })
  @IsOptional()
  @IsString()
  currency?: string = 'KES';
}

// payments/dto/paystack-callback.dto.ts

export class PaystackCallbackDto {
  @ApiProperty()
  @IsString()
  event: string;

  @ApiProperty()
  @IsObject()
  data: {
    reference: string;
    amount: number;
    status: string;
    customer: {
      email: string;
      phone?: string;
    };
    metadata?: any;
    channel?: string;
    paid_at?: string;
  };
}

// payments/dto/query-payments.dto.ts
export class QueryPaymentsDto {
  @ApiPropertyOptional({ example: 'completed' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 'device-uuid' })
  @IsOptional()
  @IsString()
  device_id?: string;

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

// payments/dto/payg-topup.dto.ts
export class PaygTopupDto {
  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.MPESA })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({ example: '254712345678' })
  @IsString()
  @Matches(/^254\d{9}$/)
  phone_number: string;
}

// payments/dto/payg-unlock.dto.ts
export class PaygUnlockDto {
  @ApiProperty({ example: 'Customer paid in cash' })
  @IsString()
  reason: string;
}
