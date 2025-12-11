import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RedisCacheService } from '../common/redis/redis-cache.service';
import { EmailService } from '../services/email.service';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class NotificationWorkerService {
  constructor(
    private redisCache: RedisCacheService,
    private emailService: EmailService,
    private logger: CustomLogger,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processPushNotifications() {
    const notifications = await this.redisCache.getPushNotifications(10);

    for (const notification of notifications) {
      try {
        // Process push notification (FCM, OneSignal, etc.)
        this.logger.log(
          `Processing push notification for user ${notification.user_id}`,
        );

        // TODO: Implement FCM push
        // await this.fcmService.send(notification);
      } catch (error) {
        this.logger.error(`Failed to send push notification: ${error.message}`);
        // Re-queue or handle error
      }
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processSmsNotifications() {
    // Similar implementation for SMS
    this.logger.log('Processing SMS notifications...');
  }
}
