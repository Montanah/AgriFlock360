import {
  isEmail,
  IsString,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  Matches,
  IsEmail,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password' })
  @IsString()
  @MinLength(6)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ example: '+254712345678', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone_number?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

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
