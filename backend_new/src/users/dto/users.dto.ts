// users/dto/update-profile.dto.ts
import { IsOptional, IsString, IsEmail, IsDateString, IsBoolean, MinLength, MaxLength, Matches, IsEnum, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @ApiProperty({ description: 'User first name', example: 'John', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  first_name?: string;

  @ApiProperty({ description: 'User last name', example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  last_name?: string;

  @ApiProperty({ description: 'Display name', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ description: 'Phone number', example: '712345678', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,15}$/, { message: 'Invalid phone number format' })
  phone_number?: string;

  @ApiProperty({ description: 'Country calling code', example: '+254', required: false })
  @IsOptional()
  @IsString()
  calling_code?: string;

  @ApiProperty({ description: 'User location/address', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Date of birth', example: '1990-01-15', required: false })
  @IsOptional()
  @IsDateString()
  date_of_birth?: Date;

  @ApiProperty({ description: 'Gender', enum: ['male', 'female', 'other', 'prefer_not_to_say'], required: false })
  @IsOptional()
  @IsEnum(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;
}

export class UpdateEmailDto {
  @ApiProperty({ description: 'New email address', example: 'newemail@example.com' })
  @IsEmail()
  @IsNotEmpty()
  new_email: string;

  @ApiProperty({ description: 'Current password for verification', example: 'currentPassword123' })
  @IsString()
  @IsNotEmpty()
  current_password: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password', example: 'oldPassword123' })
  @IsString()
  @IsNotEmpty()
  current_password: string;

  @ApiProperty({ description: 'New password', example: 'newPassword123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain uppercase, lowercase, number and special character',
  })
  new_password: string;

  @ApiProperty({ description: 'Confirm new password', example: 'newPassword123!' })
  @IsString()
  @IsNotEmpty()
  confirm_password: string;
}

// users/dto/enable-2fa.dto.ts
export class Enable2FADto {
  @ApiProperty({ description: 'Password confirmation', example: 'myPassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class Verify2FADto {
  @ApiProperty({ description: '6-digit OTP code', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'OTP must be 6 digits' })
  otp_code: string;
}

export class Disable2FADto {
  @ApiProperty({ description: '6-digit OTP code', example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'OTP must be 6 digits' })
  otp_code: string;

  @ApiProperty({ description: 'Password confirmation', example: 'myPassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

// users/dto/notification-preferences.dto.ts
export class EmailNotificationPreferencesDto {
  @ApiProperty({ description: 'Receive marketing emails', default: true })
  @IsOptional()
  @IsBoolean()
  marketing?: boolean;

  @ApiProperty({ description: 'Receive security alerts', default: true })
  @IsOptional()
  @IsBoolean()
  security_alerts?: boolean;

  @ApiProperty({ description: 'Receive product updates', default: true })
  @IsOptional()
  @IsBoolean()
  product_updates?: boolean;

  @ApiProperty({ description: 'Receive system notifications', default: true })
  @IsOptional()
  @IsBoolean()
  system_notifications?: boolean;
}

export class PushNotificationPreferencesDto {
  @ApiProperty({ description: 'Receive alerts', default: true })
  @IsOptional()
  @IsBoolean()
  alerts?: boolean;

  @ApiProperty({ description: 'Receive reminders', default: true })
  @IsOptional()
  @IsBoolean()
  reminders?: boolean;

  @ApiProperty({ description: 'Receive messages', default: true })
  @IsOptional()
  @IsBoolean()
  messages?: boolean;

  @ApiProperty({ description: 'Receive reports', default: true })
  @IsOptional()
  @IsBoolean()
  reports?: boolean;
}

export class NotificationPreferencesDto {
  @ApiProperty({ type: EmailNotificationPreferencesDto, required: false })
  @IsOptional()
  @IsObject()
  @Type(() => EmailNotificationPreferencesDto)
  email?: EmailNotificationPreferencesDto;

  @ApiProperty({ type: PushNotificationPreferencesDto, required: false })
  @IsOptional()
  @IsObject()
  @Type(() => PushNotificationPreferencesDto)
  push?: PushNotificationPreferencesDto;
}

// users/dto/privacy-settings.dto.ts
export class PrivacySettingsDto {
  @ApiProperty({ description: 'Profile visibility', enum: ['public', 'private', 'connections'], required: false })
  @IsOptional()
  @IsEnum(['public', 'private', 'connections'])
  profile_visibility?: string;

  @ApiProperty({ description: 'Show email to others', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  show_email?: boolean;

  @ApiProperty({ description: 'Show phone number to others', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  show_phone?: boolean;

  @ApiProperty({ description: 'Show location to others', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  show_location?: boolean;

  @ApiProperty({ description: 'Allow search engines to index profile', default: false, required: false })
  @IsOptional()
  @IsBoolean()
  search_engine_indexing?: boolean;

  @ApiProperty({ description: 'Allow data collection for analytics', default: true, required: false })
  @IsOptional()
  @IsBoolean()
  analytics_consent?: boolean;
}

// users/dto/device-token.dto.ts
export class RegisterDeviceTokenDto {
  @ApiProperty({ description: 'FCM/APN device token', example: 'ExponentPushToken[xxxxxxxxxxxxxx]' })
  @IsString()
  @IsNotEmpty()
  device_token: string;

  @ApiProperty({ description: 'Device platform', enum: ['ios', 'android', 'web'], example: 'android' })
  @IsEnum(['ios', 'android', 'web'])
  platform: string;

  @ApiProperty({ description: 'Device name/model', example: 'iPhone 14 Pro', required: false })
  @IsOptional()
  @IsString()
  device_name?: string;
}

// users/dto/deactivate-account.dto.ts
export class DeactivateAccountDto {
  @ApiProperty({ description: 'Password confirmation', example: 'myPassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Reason for deactivation', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

// users/dto/delete-account.dto.ts
export class DeleteAccountDto {
  @ApiProperty({ description: 'Password confirmation', example: 'myPassword123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Type DELETE to confirm', example: 'DELETE' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^DELETE$/, { message: 'Must type DELETE to confirm' })
  confirmation: string;

  @ApiProperty({ description: 'Reason for deletion', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}