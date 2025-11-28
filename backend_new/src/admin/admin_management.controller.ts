import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Req, Delete, Param, Put, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { TwoFAService } from '../services/twofa.service';
import { SessionService } from '../services/session.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from '../auth/dto/auth.dto';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import type { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto, UpdateEmailDto } from '../users/dto/users.dto';
import * as multer from 'multer';
import type { Express } from 'express';

@ApiTags('Admin Management')
@Controller('admin-management')
export class AdminManagementController {
  /**
   * Constructor
   * @param {AuthService} authService - Authentication service
   * @param {TwoFAService} twoFAService - Two Factor Authentication service
   * @param {SessionService} sessionService - Session service
   */
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
    private readonly usersService: UsersService
  ) { }

  private getClientInfo(req: Request) {
    return {
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new admin' })
  async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.authService.register(registerDto, ipAddress, userAgent);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Public()
  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify 2FA code' })
  async verify2FA(
    @Body() body: { tempToken: string; code: string },
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.authService.verify2FA(body.tempToken, body.code, ipAddress, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    const sessionId = req.headers['x-session-id'] as string;
    return this.authService.refreshToken(
      refreshTokenDto,
      sessionId,
      ipAddress,
      userAgent,
    );
  }


  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Req() req: Request,
  ) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.authService.resetPassword(resetPasswordDto, ipAddress, userAgent);
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto, @Req() req: Request) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.authService.verifyEmail(verifyEmailDto, ipAddress, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@CurrentUser() user: any, @Req() req: Request) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    const sessionId = req.headers['x-session-id'] as string;
    return this.authService.logout(user.userId, sessionId, ipAddress, userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  // Session Management
  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active sessions' })
  async getActiveSessions(@CurrentUser() user: any) {
    return this.sessionService.getUserActiveSessions(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:sessionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate specific session' })
  async invalidateSession(
    @CurrentUser() user: any,
    @Param('sessionId') sessionId: string,
  ) {
    return this.sessionService.invalidateSession(sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invalidate all sessions' })
  async invalidateAllSessions(@CurrentUser() user: any) {
    return this.sessionService.invalidateAllUserSessions(user.userId);
  }

  // ============= PROFILE MANAGEMENT =============
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('profile/avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiResponse({ status: 204, description: 'Avatar deleted successfully' })
  async deleteAvatar(@Req() req: any) {
    const userId = req.user.id;
    await this.usersService.deleteAvatar(userId);
  }

  // ============= EMAIL MANAGEMENT =============

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
}
