import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../database/entities/User.entity';
import { Role } from '../database/entities/Role.entity';
import { Farm } from '../database/entities/Farm.entity';
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
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { EmailService } from '../services/email.service';
import { TwoFAService } from '../services/twofa.service';
import { AccountLockoutService } from '../services/account-lockout.service';
import { SessionService } from '../services/session.service';
import { AuditService, AuditAction } from '../services/audit.service';
import { CustomLogger } from '../common/custom-logger.service';
import { TokenRotationService } from '../services/token-rotation.service';
import { AppleAuthService } from '../services/apple-auth.service';
import { MetricsService } from '../common/metrics.service';
import { Profile } from 'src/database/entities/Profile.entity';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(Farm)
    private farmRepository: Repository<Farm>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private twoFAService: TwoFAService,
    private lockoutService: AccountLockoutService,
    private sessionService: SessionService,
    private auditService: AuditService,
    private logger: CustomLogger,
    private tokenRotationService: TokenRotationService,
    private appleAuthService: AppleAuthService,
    private metricsService: MetricsService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async register(
    registerDto: RegisterDto,
    ipAddress: string,
    userAgent: string,
  ) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        this.logger.warn(
          `Registration attempt with existing email: ${registerDto.email}`,
        );
        throw new ConflictException('User already exists');
      }

      // Check if phone number is already in use
      const existingProfile = await this.userRepository.findOne({
        where: { phone_number: registerDto.phone_number },
      });

      if (existingProfile) {
        throw new ConflictException('Phone number already in use');
      }

      // Get default user role
      const roleName = registerDto.role || 'user'; // fallback
      const defaultRole = await this.roleRepository.findOne({
        where: { name: roleName },
      });

      if (!defaultRole) {
        throw new BadRequestException('Default role not found');
      }

      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      // const verificationCode = crypto.randomBytes(32).toString('hex');
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();

      const { role, agreed_to_terms, farm_name, password, ...rest } =
        registerDto;
      const user = this.userRepository.create({
        ...rest,
        password_hash: hashedPassword,
        role_id: defaultRole.id,
        oauth_provider: 'email',
        email_verification_code: verificationCode,
        email_verification_expires_at: new Date(
          Date.now() + 24 * 60 * 60 * 1000,
        ),
        status: 'pending',
        agreed_to_terms: agreed_to_terms === true,
        agreed_to_terms_at: agreed_to_terms === true ? new Date() : undefined,
      });

      await this.userRepository.save(user);
      user.role = defaultRole;

      //create farm
      let farm: Farm | null = null;

      // Create farm if farm_name is provided
      if (farm_name?.trim()) {
        farm = this.farmRepository.create({
          farm_name: registerDto.farm_name,
          location: registerDto.location,
          user_id: user.id,
        });
        await this.farmRepository.save(farm);

        //Set farm_id on user
        // user.farm_id = farm.id;
        // user.farm = farm;
        // await this.userRepository.save(user);
      }

      console.log('user created and farm ', user, farm);

      // Create profile
      const profile = this.profileRepository.create({
        user_id: user.id,
        full_name: registerDto.full_name,
        national_id: registerDto.national_id,
        phone_number: registerDto.phone_number,
        calling_code: '+254', // Default calling code
        date_of_birth: registerDto.date_of_birth
          ? new Date(registerDto.date_of_birth)
          : undefined,
        gender: registerDto.gender as any,
        location: registerDto.location,
        farm_id: farm?.id,
        years_of_experience: registerDto.years_of_experience,
        poultry_type: registerDto.poultry_type as any,
        chicken_house_capacity: registerDto.chicken_house_capacity,
        current_number_of_chickens: registerDto.current_number_of_chickens,
        preferred_agrovet_name: registerDto.preferred_agrovet_name,
        preferred_feed_company: registerDto.preferred_feed_company,
        preferred_chicks_company: registerDto.preferred_chicks_company,
        preferred_offtaker_agent: registerDto.preferred_offtaker_agent,
      });

      await this.profileRepository.save(profile);

      console.log('User, profile, and farm created:', { user, profile, farm });

      // Send verification email
      await this.emailService.sendVerificationEmail(
        user.email,
        verificationCode,
      );

      // Generate tokens
      const tokens = await this.generateTokens(user, ipAddress, userAgent);

      // Audit log
      await this.auditService.log(
        user.id,
        AuditAction.REGISTER,
        'user',
        user.id,
        ipAddress,
        userAgent,
      );

      this.logger.log(`New user registered: ${user.email}`);
      this.metricsService.recordAuthSuccess('register');

      return {
        message: 'Registration successful. Please verify your email.',
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error(`Registration failed: ${error.message}`, error.stack);
      this.metricsService.recordAuthFailure('register', error.message);
      throw error;
    }
  }

  async login(loginDto: LoginDto, ipAddress: string, userAgent: string) {
    try {
      const identifier = (loginDto.email || loginDto.phone_number)!;

      // Check account lockout
      const isLocked = await this.lockoutService.isAccountLocked(identifier);

      if (isLocked) {
        const remainingTime =
          await this.lockoutService.getRemainingLockoutTime(identifier);
        throw new UnauthorizedException(
          `Account locked. Try again in ${remainingTime} minutes.`,
        );
      }

      const user = await this.userRepository.findOne({
        where: [
          { email: loginDto.email },
          { phone_number: loginDto.phone_number },
        ].filter((condition) =>
          Object.values(condition).some((value) => value !== undefined),
        ),
        relations: ['role'],
      });

      if (!user) {
        await this.lockoutService.recordFailedAttempt(identifier, ipAddress);
        this.metricsService.recordAuthFailure('login', 'user_not_found');
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!user.password_hash) {
        this.metricsService.recordAuthFailure('login', 'oauth_only');
        throw new UnauthorizedException(
          'Please use OAuth login (Google/Apple)',
        );
      }

      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password_hash,
      );

      if (!isPasswordValid) {
        const lockoutInfo = await this.lockoutService.recordFailedAttempt(
          identifier,
          ipAddress,
        );

        this.metricsService.recordAuthFailure('login', 'invalid_password');

        if (lockoutInfo.locked) {
          this.logger.logSecurityEvent('ACCOUNT_LOCKED', user.id, {
            reason: 'too_many_failed_attempts',
            ipAddress,
          });

          await this.auditService.log(
            user.id,
            AuditAction.ACCOUNT_LOCKED,
            'user',
            user.id,
            ipAddress,
            userAgent,
            { reason: 'too_many_failed_attempts' },
          );
        }

        throw new UnauthorizedException(
          lockoutInfo.locked
            ? 'Too many failed attempts. Account locked.'
            : `Invalid credentials. ${lockoutInfo.remainingAttempts} attempts remaining.`,
        );
      }

      if (!user.is_active) {
        this.metricsService.recordAuthFailure('login', 'inactive_account');
        throw new UnauthorizedException('Account is inactive');
      }

      // Record successful attempt
      await this.lockoutService.recordSuccessfulAttempt(identifier, ipAddress);

      // Check 2FA
      if (user.is_2fa_enabled) {
        // Return temp token for 2FA verification
        return {
          requires2FA: true,
          tempToken: this.jwtService.sign(
            { sub: user.id, purpose: '2fa' },
            { expiresIn: '5m' },
          ),
        };
      }

      // Generate tokens
      const tokens = await this.generateTokens(user, ipAddress, userAgent);

      // Send login alert
      await this.emailService.sendLoginAlert(user.email, ipAddress, userAgent);

      // Audit log
      await this.auditService.log(
        user.id,
        AuditAction.LOGIN,
        'user',
        user.id,
        ipAddress,
        userAgent,
      );

      this.logger.log(`User logged in: ${user.email}`);
      this.metricsService.recordAuthSuccess('login');

      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error(`Login failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  async verify2FA(
    tempToken: string,
    code: string,
    ipAddress: string,
    userAgent: string,
  ) {
    try {
      const payload = this.jwtService.verify(tempToken);

      if (payload.purpose !== '2fa') {
        throw new UnauthorizedException('Invalid token');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });

      if (!user) {
        this.metricsService.recordAuthFailure('2fa', 'user_not_found');
        throw new UnauthorizedException('User not found');
      }

      const isValid = await this.twoFAService.verify2FAToken(user.id, code);

      if (!isValid) {
        this.metricsService.recordAuthFailure('2fa', 'invalid_code');
        throw new UnauthorizedException('Invalid 2FA code');
      }

      const tokens = await this.generateTokens(user, ipAddress, userAgent);

      await this.auditService.log(
        user.id,
        AuditAction.LOGIN,
        'user',
        user.id,
        ipAddress,
        userAgent,
        { method: '2fa' },
      );

      this.metricsService.recordAuthSuccess('2fa');

      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error(
        `2FA verification failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async googleAuth(
    googleAuthDto: GoogleAuthDto,
    ipAddress: string,
    userAgent: string,
  ) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleAuthDto.idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const { sub, email, given_name, family_name } = payload;

      let user = await this.userRepository.findOne({
        where: { google_id: sub },
        relations: ['role'],
      });

      if (!user) {
        user = await this.userRepository.findOne({
          where: { email },
          relations: ['role'],
        });

        if (user) {
          // Link Google account
          user.google_id = sub;
          user.oauth_provider = 'google';
          await this.userRepository.save(user);
        } else {
          // Create new user
          const defaultRole = await this.roleRepository.findOne({
            where: { name: 'user' },
          });

          if (!defaultRole) {
            throw new Error('Default role not found');
          }

          user = this.userRepository.create({
            email,
            google_id: sub,
            name: `${given_name} ${family_name}`,
            oauth_provider: 'google',
            role_id: defaultRole.id,
            status: 'active',
            is_active: true,
          });

          await this.userRepository.save(user);
          user.role = defaultRole;

          await this.auditService.log(
            user.id,
            AuditAction.REGISTER,
            'user',
            user.id,
            ipAddress,
            userAgent,
            { method: 'google' },
          );
        }
      }

      const tokens = await this.generateTokens(user, ipAddress, userAgent);

      await this.auditService.log(
        user.id,
        AuditAction.LOGIN,
        'user',
        user.id,
        ipAddress,
        userAgent,
        { method: 'google' },
      );

      this.metricsService.recordAuthSuccess('google');

      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error(`Google auth failed: ${error.message}`, error.stack);
      this.metricsService.recordAuthFailure('google', error.message);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  async appleAuth(
    appleAuthDto: AppleAuthDto,
    ipAddress: string,
    userAgent: string,
  ) {
    try {
      const appleData = await this.appleAuthService.verifyToken(
        appleAuthDto.idToken,
        appleAuthDto.user,
      );

      let user = await this.userRepository.findOne({
        where: { apple_id: appleData.apple_id },
        relations: ['role'],
      });

      if (!user) {
        user = await this.userRepository.findOne({
          where: { email: appleData.email },
          relations: ['role'],
        });

        if (user) {
          user.apple_id = appleData.apple_id;
          user.oauth_provider = 'apple';
          await this.userRepository.save(user);
        } else {
          const defaultRole = await this.roleRepository.findOne({
            where: { name: 'user' },
          });

          if (!defaultRole) {
            throw new Error('Default role not found');
          }

          user = this.userRepository.create({
            email: appleData.email,
            apple_id: appleData.apple_id,
            oauth_provider: 'apple',
            role_id: defaultRole.id,
            status: 'active',
            is_active: true,
          });

          await this.userRepository.save(user);
          user.role = defaultRole;
        }
      }

      const tokens = await this.generateTokens(user, ipAddress, userAgent);

      await this.auditService.log(
        user.id,
        AuditAction.LOGIN,
        'user',
        user.id,
        ipAddress,
        userAgent,
        { method: 'apple' },
      );

      this.metricsService.recordAuthSuccess('apple');

      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      this.logger.error(`Apple auth failed: ${error.message}`, error.stack);
      this.metricsService.recordAuthFailure('apple', error.message);
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
    sessionId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    try {
      // Validate session
      const isValidSession = await this.sessionService.validateSession(
        sessionId,
        refreshTokenDto.refresh_token,
      );

      if (!isValidSession) {
        throw new UnauthorizedException('Invalid session');
      }

      const payload = this.jwtService.verify(refreshTokenDto.refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });

      if (!user || !user.is_active) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Rotate tokens
      const newTokens = await this.tokenRotationService.rotateRefreshToken(
        refreshTokenDto.refresh_token,
        user.id,
      );

      // Update session
      await this.sessionService.createSession(
        user.id,
        ipAddress,
        userAgent,
        newTokens.refresh_token,
      );

      this.metricsService.recordAuthSuccess('refresh');

      return newTokens;
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`, error.stack);
      this.metricsService.recordAuthFailure('refresh', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      return { message: 'If email exists, reset link will be sent' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = await bcrypt.hash(resetToken, 10);

    user.password_reset_token = hashedToken;
    user.password_reset_expires_at = new Date(Date.now() + 60 * 60 * 1000);

    await this.userRepository.save(user);
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    this.logger.log(`Password reset requested for: ${user.email}`);

    return { message: 'If email exists, reset link will be sent' };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    ipAddress: string,
    userAgent: string,
  ) {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .where('user.password_reset_expires_at > :now', { now: new Date() })
      .getMany();

    let user: User | null = null;

    for (const u of users) {
      const isValid = await bcrypt.compare(
        resetPasswordDto.token,
        u.password_reset_token || '',
      );
      if (isValid) {
        user = u;
        break;
      }
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    user.password_hash = await bcrypt.hash(resetPasswordDto.password, 10);
    user.password_reset_token = undefined;
    user.password_reset_expires_at = undefined;

    await this.userRepository.save(user);

    // Invalidate all sessions
    await this.sessionService.invalidateAllUserSessions(user.id);

    await this.auditService.log(
      user.id,
      AuditAction.PASSWORD_RESET,
      'user',
      user.id,
      ipAddress,
      userAgent,
    );

    this.logger.log(`Password reset for: ${user.email}`);

    return { message: 'Password reset successful' };
  }

  async verifyEmail(
    verifyEmailDto: VerifyEmailDto,
    ipAddress: string,
    userAgent: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { email_verification_code: verifyEmailDto.code },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification code');
    }

    if (
      !user.email_verification_expires_at ||
      user.email_verification_expires_at < new Date()
    ) {
      throw new BadRequestException('Verification code expired');
    }

    user.status = 'active';
    user.is_active = true;
    user.email_verification_code = undefined;
    user.email_verification_expires_at = undefined;

    await this.userRepository.save(user);

    await this.auditService.log(
      user.id,
      AuditAction.EMAIL_VERIFIED,
      'user',
      user.id,
      ipAddress,
      userAgent,
    );

    return { message: 'Email verified successfully' };
  }

  async logout(
    userId: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string,
  ) {
    await this.sessionService.invalidateSession(sessionId);

    await this.auditService.log(
      userId,
      AuditAction.LOGOUT,
      'user',
      userId,
      ipAddress,
      userAgent,
    );

    return { message: 'Logout successful' };
  }

  private async generateTokens(
    user: User,
    ipAddress: string,
    userAgent: string,
  ) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role?.name || 'user',
      location: user.profile?.location,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
      jwtid: crypto.randomUUID(),
    });

    // Create session
    const sessionId = await this.sessionService.createSession(
      user.id,
      ipAddress,
      userAgent,
      refreshToken,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      session_id: sessionId,
      expires_in: 900,
    };
  }

  private sanitizeUser(user: User) {
    const {
      password_hash,
      refresh_token,
      email_verification_code,
      password_reset_token,
      ...sanitized
    } = user;
    return sanitized;
  }
}
