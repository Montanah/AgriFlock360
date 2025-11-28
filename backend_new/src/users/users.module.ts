// users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../database/entities/User.entity';
import { UserPreferences } from '../database/entities/UserPreferences.entity';
import { DeviceToken } from '../database/entities/DeviceToken.entity';
import { UserActivity } from '../database/entities/UserActivity.entity';
import { AuditLog } from '../database/entities/AuditLog.entity';
import { UploadsModule } from '../uploads/uploads.module';
import { EmailService } from '../services/email.service';
import { CustomLogger } from '../common/custom-logger.service';
import { AuditService } from '../services/audit.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserPreferences,
      DeviceToken,
      UserActivity,
      AuditLog,
    ]),
    ConfigModule,
    UploadsModule, 
  ],
  controllers: [UsersController],
  providers: [UsersService, CustomLogger, EmailService, AuditService],
  exports: [UsersService],
})
export class UsersModule {}
