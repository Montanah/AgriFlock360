// admin/admin.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SystemConfig } from '../database/entities/SystemConfig.entity';
import { AuditLog } from '../database/entities/AuditLog.entity';
import { User } from '../database/entities/User.entity';
import { Device } from '../database/entities/Device.entity';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService } from '../services/audit.service';
import { AdminManagementController } from './admin_management.controller';

import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { Role } from '../database/entities/Role.entity';
import { Farm } from '../database/entities/Farm.entity';
import { Batch } from '../database/entities/Batch.entity';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { GoogleStrategy } from '../auth/strategies/google.strategy';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TwoFactorAuth } from '../database/entities/Two-factor-auth.entity';
import { LoginAttempt } from '../database/entities/Login-attempt.entity';
import { UserSession } from '../database/entities/User-session.entity';
import { RateLimitLog } from '../database/entities/Rate-limit-log.entity';
import { EmailService } from '../services/email.service';
import { TwoFAService } from '../services/twofa.service';
import { AccountLockoutService } from '../services/account-lockout.service';
import { SessionService } from '../services/session.service';
import { TokenRotationService } from '../services/token-rotation.service';
import { AppleAuthService } from '../services/apple-auth.service';
import { MetricsService } from '../common/metrics.service';
import { RateLimitGuard } from '../auth/guards/rate-limit.guard';
import { LoggingInterceptor } from '../common/logging.interceptor';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UsersModule } from '../users/users.module';
import { Payment } from '../database/entities/Payment.entity';
import { Profile } from '../database/entities/Profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemConfig,
      AuditLog,
      User,
      Device,
      Role,
      TwoFactorAuth,
      Farm,
      LoginAttempt,
      UserSession,
      RateLimitLog,
      Batch,
      Payment,
      Profile,
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
  controllers: [AdminController, AdminManagementController],
  providers: [AdminService, CustomLogger, AuditService,
    AuthService,
    EmailService,
    TwoFAService,
    AccountLockoutService,
    SessionService,
    TokenRotationService,
    AppleAuthService,
    MetricsService,
    JwtStrategy,
    GoogleStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
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
  ],
  exports: [AdminService],
})
export class AdminModule {}
