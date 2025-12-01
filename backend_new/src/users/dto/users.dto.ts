// users/dto/update-profile.dto.ts
import { IsOptional, IsString, IsEmail, IsDateString, IsBoolean, MinLength, MaxLength, Matches, IsEnum, IsNotEmpty, IsObject, IsIn, IsInt, Min, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Display name', example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  full_name?: string;

  @ApiProperty({ example: '12345678', required: false })
  @IsOptional()
  @IsString()
  national_id?: string;

  @ApiProperty({ example: '+254712345678' })
  @IsOptional()
  @IsPhoneNumber()
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

  @ApiProperty({ 
    example: 'male', 
    enum: ['male', 'female', 'other', 'prefer_not_to_say'], 
    required: false 
  })
  @IsOptional()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;

  @ApiProperty({ example: 5, description: 'Years of experience', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  years_of_experience?: number;

  @ApiProperty({ 
    example: 'layers', 
    enum: ['layers', 'broilers', 'both', 'indigenous', 'other'],
    required: false 
  })
  @IsOptional()
  @IsIn(['layers', 'broilers', 'both', 'indigenous', 'other'])
  poultry_type?: string;

  @ApiProperty({ example: 1000, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  chicken_house_capacity?: number;

  @ApiProperty({ example: 500, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  current_number_of_chickens?: number;

  @ApiProperty({ example: 'Farmers Choice Agrovet', required: false })
  @IsOptional()
  @IsString()
  preferred_agrovet_name?: string;

  @ApiProperty({ example: 'Pembe Feeds', required: false })
  @IsOptional()
  @IsString()
  preferred_feed_company?: string;

  @ApiProperty({ example: 'Kenchic Hatcheries', required: false })
  @IsOptional()
  @IsString()
  preferred_chicks_company?: string;

  @ApiProperty({ example: 'County Eggs Collector', required: false })
  @IsOptional()
  @IsString()
  preferred_offtaker_agent?: string;

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