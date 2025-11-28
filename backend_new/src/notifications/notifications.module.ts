// notifications/notifications.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from '../database/entities/Notification.entity';
import { UserNotificationSetting } from '../database/entities/UserNotificationSetting.entity';
import { SentNotification } from '../database/entities/SentNotification.entity';
import { CustomLogger } from '../common/custom-logger.service';
import { EmailService } from '../services/email.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      UserNotificationSetting,
      SentNotification,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, CustomLogger, EmailService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
