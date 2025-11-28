import {
  isEmail,
  IsString,
  MinLength,
  IsOptional,
  IsPhoneNumber,
  Matches,
  IsEmail,
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

  @ApiProperty({ example: 'password' })
  @IsString()
  @MinLength(6)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'password too weak',
  })
  password: string;

  @ApiProperty({ example: 'My Awesome Farm', required: false })
  @IsString()
  @IsOptional()
  farm_name: string;                       

  @ApiProperty({ example: 'user', required: false, default: 'user' })
  @IsOptional()
  @IsString()
  role?: string = 'user';

  @ApiProperty({ example: 'John Doe', required: true})
  @IsString()
  name: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiProperty({ example: '+254712345678', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone_number?: string;

  @ApiProperty({ example: 'Nairobi, Kenya', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: true, required: true })
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
