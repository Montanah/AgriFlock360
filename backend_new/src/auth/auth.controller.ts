import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  Delete,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { TwoFAService } from '../services/twofa.service';
import { SessionService } from '../services/session.service';
import {
  RegisterDto,
  LoginDto,
  GoogleAuthDto,
  AppleAuthDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFAService: TwoFAService,
    private readonly sessionService: SessionService,
  ) {}

  private getClientInfo(req: Request) {
    return {
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('user-agent') || 'unknown',
    };
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
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
    return this.authService.verify2FA(
      body.tempToken,
      body.code,
      ipAddress,
      userAgent,
    );
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google OAuth login' })
  async googleAuth(@Body() googleAuthDto: GoogleAuthDto, @Req() req: Request) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.authService.googleAuth(googleAuthDto, ipAddress, userAgent);
  }

  @Public()
  @Post('apple')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apple Sign-In' })
  async appleAuth(@Body() appleAuthDto: AppleAuthDto, @Req() req: Request) {
    const { ipAddress, userAgent } = this.getClientInfo(req);
    return this.authService.appleAuth(appleAuthDto, ipAddress, userAgent);
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
    return this.authService.resetPassword(
      resetPasswordDto,
      ipAddress,
      userAgent,
    );
  }

  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
    @Req() req: Request,
  ) {
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
    return this.authService.logout(
      user.userId,
      sessionId,
      ipAddress,
      userAgent,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async getCurrentUser(@CurrentUser() user: any) {
    return user;
  }

  // 2FA Endpoints
  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate 2FA secret' })
  async generate2FA(@CurrentUser() user: any) {
    return this.twoFAService.generateSecret(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/enable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Enable 2FA' })
  async enable2FA(@CurrentUser() user: any, @Body() body: { token: string }) {
    return this.twoFAService.enable2FA(user.userId, body.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disable 2FA' })
  async disable2FA(@CurrentUser() user: any, @Body() body: { token: string }) {
    return this.twoFAService.disable2FA(user.userId, body.token);
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
}
