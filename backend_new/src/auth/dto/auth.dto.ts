import {
  isEmail,
  IsString,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  Matches,
  IsEmail,
  IsIn,
  IsInt,
  Min,
  IsDateString,
  ValidateIf,
  IsBoolean,
  IsNotEmpty,
  Equals
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateLoginCredentials } from './custom-validators';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @ApiProperty({ example: 'user', required: false, default: 'user' })
  @IsOptional()
  @IsString()
  role?: string = 'user';

  // Basic Profile Information
  @ApiProperty({ example: 'John Doe Kamau' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: '12345678', required: false })
  @IsOptional()
  @IsString()
  national_id?: string;

  @ApiProperty({ example: '+254712345678' })
  @IsPhoneNumber()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({ example: '1990-01-15', required: false })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({ example: 'male', enum: ['male', 'female', 'other', 'prefer_not_to_say'], required: false })
  @IsOptional()
  @IsIn(['male', 'female', 'other', 'prefer_not_to_say'])
  gender?: string;

  @ApiProperty({ example: 'Nairobi, Kenya', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  // Farm Information
  @ApiProperty({ example: 'My Awesome Farm', required: false })
  @IsOptional()
  @IsString()
  farm_name?: string;

  @ApiProperty({ example: 5, description: 'Years of poultry farming experience', required: false })
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

  @ApiProperty({ example: 1000, description: 'Maximum chicken house capacity', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  chicken_house_capacity?: number;

  @ApiProperty({ example: 500, description: 'Current number of chickens', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  current_number_of_chickens?: number;

  // Preferred Suppliers
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

  // Terms and Conditions
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsNotEmpty()
  @Equals(true, { message: 'You must agree to the terms and conditions' })
  agreed_to_terms: boolean;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+254712345678', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone_number?: string;

  @ValidateLoginCredentials()
  @ApiProperty({ example: 'password' })
  @IsString()
  password: string;
}

export class GoogleAuthDto {
  @ApiProperty({ example: 'google_id_token_here' })
  @IsString()
  idToken: string;
}

export class AppleAuthDto {
  @ApiProperty({ example: 'apple_id_token_here' })
  @IsString()
  idToken: string;

  @ApiProperty({ example: 'user_identifier' })
  @IsString()
  user: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh_token_here' })
  @IsString()
  refresh_token: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset_token_here' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewPassword123!' })
  @IsString()
  @MinLength(8)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password too weak',
  })
  password: string;
}

export class VerifyEmailDto {
  @ApiProperty({ example: 'verification_code_here' })
  @IsString()
  code: string;
}
