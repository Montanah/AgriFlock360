// users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateProfileDto, UpdateEmailDto, ChangePasswordDto, Enable2FADto, Verify2FADto, Disable2FADto, NotificationPreferencesDto, PrivacySettingsDto, RegisterDeviceTokenDto, DeactivateAccountDto, DeleteAccountDto  } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as multer from 'multer';
import type { Express } from 'express';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ============= PROFILE MANAGEMENT =============

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile with preferences' })
  async getProfile(@Req() req: any) {
    const userId = req.user.id;
    const profile = await this.usersService.getProfile(userId);

    return {
      success: true,
      data: profile,
    };
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  async updateProfile(@Req() req: any, @Body() updateDto: UpdateProfileDto) {
    const userId = req.user.id;
    const user = await this.usersService.updateProfile(userId, updateDto);

    return {
      success: true,
      message: 'Profile updated successfully',
      data: user,
    };
  }

  @Post('profile/avatar')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user.id;
    const result = await this.usersService.updateAvatar(userId, file);

    return {
      success: true,
      message: 'Avatar updated successfully',
      data: result,
    };
  }

  @Delete('profile/avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiResponse({ status: 204, description: 'Avatar deleted successfully' })
  async deleteAvatar(@Req() req: any) {
    const userId = req.user.id;
    await this.usersService.deleteAvatar(userId);
  }

  // ============= EMAIL MANAGEMENT =============

  @Put('email')
  @ApiOperation({ summary: 'Request email change' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 401, description: 'Invalid password' })
  @ApiResponse({ status: 409, description: 'Email already in use' })
  async updateEmail(@Req() req: any, @Body() updateEmailDto: UpdateEmailDto) {
    const userId = req.user.id;
    await this.usersService.updateEmail(userId, updateEmailDto);

    return {
      success: true,
      message: 'Verification email sent. Please check your new email address.',
    };
  }

  @Post('email/verify/:code')
  @ApiOperation({ summary: 'Verify email change' })
  @ApiResponse({ status: 200, description: 'Email verified and updated' })
  async verifyEmailChange(@Req() req: any, @Param('code') code: string) {
    const userId = req.user.id;
    await this.usersService.verifyEmailChange(userId, code);

    return {
      success: true,
      message: 'Email successfully updated',
    };
  }

  // ============= PASSWORD MANAGEMENT =============

  @Put('password')
  @ApiOperation({ summary: 'Change password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid current password' })
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    const userId = req.user.id;
    await this.usersService.changePassword(userId, changePasswordDto);

    return {
      success: true,
      message: 'Password changed successfully. Please login again.',
    };
  }

  // ============= TWO-FACTOR AUTHENTICATION =============

  @Post('2fa/enable')
  @ApiOperation({ summary: 'Enable 2FA - Step 1: Generate QR code' })
  @ApiResponse({ status: 200, description: 'Returns secret and QR code' })
  async enable2FA(@Req() req: any, @Body() enable2FADto: Enable2FADto) {
    const userId = req.user.id;
    const result = await this.usersService.enable2FA(userId, enable2FADto);

    return {
      success: true,
      message: 'Scan QR code with your authenticator app and verify',
      data: result,
    };
  }

  @Post('2fa/verify')
  @ApiOperation({ summary: 'Enable 2FA - Step 2: Verify OTP code' })
  @ApiResponse({ status: 200, description: '2FA enabled successfully' })
  async verify2FA(@Req() req: any, @Body() verify2FADto: Verify2FADto) {
    const userId = req.user.id;
    await this.usersService.verify2FA(userId, verify2FADto);

    return {
      success: true,
      message: '2FA enabled successfully',
    };
  }

  @Post('2fa/disable')
  @ApiOperation({ summary: 'Disable 2FA' })
  @ApiResponse({ status: 200, description: '2FA disabled successfully' })
  async disable2FA(@Req() req: any, @Body() disable2FADto: Disable2FADto) {
    const userId = req.user.id;
    await this.usersService.disable2FA(userId, disable2FADto);

    return {
      success: true,
      message: '2FA disabled successfully',
    };
  }

  // ============= NOTIFICATION PREFERENCES =============

  @Get('preferences/notifications')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Returns notification preferences' })
  async getNotificationPreferences(@Req() req: any) {
    const userId = req.user.id;
    const preferences = await this.usersService.getNotificationPreferences(userId);

    return {
      success: true,
      data: preferences,
    };
  }

  @Put('preferences/notifications')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updateNotificationPreferences(
    @Req() req: any,
    @Body() preferencesDto: NotificationPreferencesDto,
  ) {
    const userId = req.user.id;
    await this.usersService.updateNotificationPreferences(userId, preferencesDto);

    return {
      success: true,
      message: 'Notification preferences updated successfully',
    };
  }

  // ============= PRIVACY SETTINGS =============

  @Get('privacy')
  @ApiOperation({ summary: 'Get privacy settings' })
  @ApiResponse({ status: 200, description: 'Returns privacy settings' })
  async getPrivacySettings(@Req() req: any) {
    const userId = req.user.id;
    const settings = await this.usersService.getPrivacySettings(userId);

    return {
      success: true,
      data: settings,
    };
  }

  @Put('privacy')
  @ApiOperation({ summary: 'Update privacy settings' })
  @ApiResponse({ status: 200, description: 'Privacy settings updated successfully' })
  async updatePrivacySettings(@Req() req: any, @Body() privacyDto: PrivacySettingsDto) {
    const userId = req.user.id;
    await this.usersService.updatePrivacySettings(userId, privacyDto);

    return {
      success: true,
      message: 'Privacy settings updated successfully',
    };
  }

  // ============= DEVICE TOKEN MANAGEMENT =============

  @Post('devices/register')
  @ApiOperation({ summary: 'Register device token for push notifications' })
  @ApiResponse({ status: 200, description: 'Device token registered successfully' })
  async registerDeviceToken(@Req() req: any, @Body() tokenDto: RegisterDeviceTokenDto) {
    const userId = req.user.id;
    await this.usersService.registerDeviceToken(userId, tokenDto);

    return {
      success: true,
      message: 'Device registered successfully',
    };
  }

  @Delete('devices/:token')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove device token' })
  @ApiResponse({ status: 204, description: 'Device token removed successfully' })
  async removeDeviceToken(@Req() req: any, @Param('token') token: string) {
    const userId = req.user.id;
    await this.usersService.removeDeviceToken(userId, token);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get all registered devices' })
  @ApiResponse({ status: 200, description: 'Returns list of registered devices' })
  async getUserDevices(@Req() req: any) {
    const userId = req.user.id;
    const devices = await this.usersService.getUserDeviceTokens(userId);

    return {
      success: true,
      data: devices,
    };
  }

  // ============= ACCOUNT MANAGEMENT =============

  @Post('account/deactivate')
  @ApiOperation({ summary: 'Deactivate account (reversible)' })
  @ApiResponse({ status: 200, description: 'Account deactivated successfully' })
  async deactivateAccount(@Req() req: any, @Body() deactivateDto: DeactivateAccountDto) {
    const userId = req.user.id;
    await this.usersService.deactivateAccount(userId, deactivateDto);

    return {
      success: true,
      message: 'Account deactivated successfully',
    };
  }

  @Post('account/reactivate')
  @ApiOperation({ summary: 'Reactivate deactivated account' })
  @ApiResponse({ status: 200, description: 'Account reactivated successfully' })
  async reactivateAccount(@Req() req: any) {
    const userId = req.user.id;
    await this.usersService.reactivateAccount(userId);

    return {
      success: true,
      message: 'Account reactivated successfully',
    };
  }

  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete account' })
  @ApiResponse({ status: 204, description: 'Account deleted successfully' })
  async deleteAccount(@Req() req: any, @Body() deleteDto: DeleteAccountDto) {
    const userId = req.user.id;
    await this.usersService.deleteAccount(userId, deleteDto);
  }

  // ============= ACCOUNT ACTIVITY =============
  @Get('activity/login-history')
  @ApiOperation({ summary: 'Get login history' })
  @ApiResponse({ status: 200, description: 'Returns paginated login history' })
  async getLoginHistory(@Req() req: any) {
    const userId = req.user.id;
    const history = await this.usersService.getLoginHistory(userId);

    return {
      success: true,
      data: history,
    };
  }
  
}
