import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../database/entities/User.entity';
import { Role } from '../database/entities/Role.entity';
import { Farm } from '../database/entities/Farm.entity';
import { Profile } from '../database/entities/Profile.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TwoFactorAuth } from '../database/entities/Two-factor-auth.entity';
import { LoginAttempt } from '../database/entities/Login-attempt.entity';
import { UserSession } from '../database/entities/User-session.entity';
import { RateLimitLog } from '../database/entities/Rate-limit-log.entity';
import { AuditLog } from '../database/entities/AuditLog.entity';
import { Device } from '../database/entities/Device.entity';
import { EmailService } from '../services/email.service';
import { TwoFAService } from '../services/twofa.service';
import { AccountLockoutService } from '../services/account-lockout.service';
import { SessionService } from '../services/session.service';
import { AuditService } from '../services/audit.service';
import { TokenRotationService } from '../services/token-rotation.service';
import { AppleAuthService } from '../services/apple-auth.service';
import { CustomLogger } from '../common/custom-logger.service';
import { MetricsService } from '../common/metrics.service';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { LoggingInterceptor } from '../common/logging.interceptor';
import { PermissionsGuard } from './guards/permissions.guard';
import { UsersModule } from '../users/users.module';
import { CountryGuard } from './guards/country.guard';
import { DeviceAuthGuard } from './guards/device-auth.guard';
import { DeviceOrUserAuthGuard } from './guards/device-or-user-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Farm, Profile, TwoFactorAuth,
      LoginAttempt,
      UserSession,
      RateLimitLog,
      AuditLog,
      Device,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    TwoFAService,
    AccountLockoutService,
    SessionService,
    AuditService,
    TokenRotationService,
    AppleAuthService,
    CustomLogger,
    MetricsService,
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    RolesGuard,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    RateLimitGuard,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    PermissionsGuard,
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    CountryGuard,
    {
      provide: APP_GUARD,
      useClass: CountryGuard,
    },
    DeviceAuthGuard,
    {
      provide: APP_GUARD,
      useClass: DeviceAuthGuard,
    },
    DeviceOrUserAuthGuard,
    {
      provide: APP_GUARD,
      useClass: DeviceOrUserAuthGuard,
    },

  ],
  exports: [AuthService, JwtModule, PermissionsGuard, DeviceOrUserAuthGuard, DeviceAuthGuard, JwtAuthGuard],
})
export class AuthModule {}
