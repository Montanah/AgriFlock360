// notifications/notifications.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from '../database/entities/Notification.entity';
import { UserNotificationSetting } from '../database/entities/UserNotificationSetting.entity';
import { SentNotification } from '../database/entities/SentNotification.entity';
import { CreateNotificationDto, NotificationType, QueryNotificationsDto } from '../notifications/dto/notifications.dto';
import { CustomLogger } from '../common/custom-logger.service';
import { EmailService } from '../services/email.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(UserNotificationSetting)
    private settingsRepository: Repository<UserNotificationSetting>,
    @InjectRepository(SentNotification)
    private sentNotificationRepository: Repository<SentNotification>,
    private logger: CustomLogger,
    private emailService: EmailService,
  ) {}

  async create(
    userId: string,
    createNotificationDto: CreateNotificationDto,
  ) {
    const notification = this.notificationRepository.create({
      ...createNotificationDto,
      user_id: userId,
    });

    await this.notificationRepository.save(notification);

    // Attempt to send immediately
    await this.sendNotification(notification);

    return notification;
  }

  async findAll(userId: string, query: QueryNotificationsDto) {
    const { is_read, type, page=1, limit=20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.user_id = :userId', { userId })
      .skip(skip)
      .take(limit)
      .orderBy('notification.created_at', 'DESC');

    if (is_read !== undefined) {
      queryBuilder.andWhere('notification.is_read = :is_read', { is_read });
    }

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    const [notifications, total] = await queryBuilder.getManyAndCount();

    // Get unread count
    const unreadCount = await this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });

    return {
      notifications,
      unread_count: unreadCount,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    if (!notification.is_read) {
      notification.is_read = true;
      notification.read_at = new Date();
      await this.notificationRepository.save(notification);
    }

    return notification;
  }

  async markAllAsRead(userId: string) {
    const result = await this.notificationRepository.update(
      { user_id: userId, is_read: false },
      { is_read: true, read_at: new Date() },
    );

    return { count: result.affected || 0 };
  }

  async delete(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.user_id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    await this.notificationRepository.remove(notification);

    return { success: true };
  }

  async getSettings(userId: string) {
    const settings = await this.settingsRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });

    return { settings };
  }

  async updateSettings(
    userId: string,
    notificationType: string,
    data: Partial<UserNotificationSetting>,
  ) {
    let setting = await this.settingsRepository.findOne({
      where: { user_id: userId, notification_type: notificationType },
    });

    if (!setting) {
      setting = this.settingsRepository.create({
        user_id: userId,
        notification_type: notificationType,
        ...data,
      });
    } else {
      Object.assign(setting, data);
    }

    await this.settingsRepository.save(setting);

    return setting;
  }

  private async sendNotification(notification: Notification) {
    try {
      // Check user settings
      const setting = await this.settingsRepository.findOne({
        where: {
          user_id: notification.user_id,
          notification_type: notification.type,
          is_enabled: true,
        },
      });

      // If settings exist and disabled, skip
      if (setting && !setting.is_enabled) {
        this.logger.log(`Notification skipped (disabled): ${notification.id}`);
        return;
      }

      // Send based on delivery channel
      switch (notification.delivery_channel) {
        case 'email':
          await this.sendEmailNotification(notification);
          break;
        case 'sms':
          // await this.sendSmsNotification(notification);
          this.logger.log(`SMS notification queued: ${notification.id}`);
          break;
        case 'push':
          // await this.sendPushNotification(notification);
          this.logger.log(`Push notification queued: ${notification.id}`);
          break;
        default:
          this.logger.log(`Unsupported channel: ${notification.delivery_channel}`);
      }

      notification.is_sent = true;
      notification.sent_at = new Date();
      await this.notificationRepository.save(notification);
    } catch (error) {
      this.logger.error(
        `Failed to send notification ${notification.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  private async sendEmailNotification(notification: Notification) {
    // Get user email
    const user = await this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .where('notification.id = :id', { id: notification.id })
      .getOne();

    if (!user?.user?.email) {
      throw new Error('User email not found');
    }

    // Send email using email service
    await this.emailService.sendGenericNotification(
      user.user.email,
      notification.title,
      notification.body || '',
    );

    this.logger.log(`Email notification sent: ${notification.id}`);
  }

  // Scheduled notification sender for reminders
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processScheduledNotifications() {
    this.logger.log('Processing scheduled notifications');

    // Find unsent notifications older than 1 minute
    const unsent = await this.notificationRepository.find({
      where: { is_sent: false },
      take: 100,
    });

    for (const notification of unsent) {
      await this.sendNotification(notification);
    }

    this.logger.log(`Processed ${unsent.length} scheduled notifications`);
  }

  // Create system notifications for events
  async createVaccinationReminder(
    userId: string,
    vaccinationId: string,
    vaccineName: string,
    scheduledDate: Date,
  ) {
    const daysUntil = Math.ceil(
      (scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    await this.create(userId, {
      title: 'Vaccination Reminder',
      body: `${vaccineName} is scheduled in ${daysUntil} days (${scheduledDate.toDateString()})`,
      type: NotificationType.REMINDER,
      entity_type: 'vaccination',
      entity_id: vaccinationId,
      delivery_channel: 'email',
    });
  }

  async createPaymentNotification(
    userId: string,
    paymentId: string,
    amount: number,
    status: string,
  ) {
    await this.create(userId, {
      title: `Payment ${status}`,
      body: `Your payment of KES ${amount} has been ${status.toLowerCase()}`,
      type: NotificationType.INFO,
      entity_type: 'payment',
      entity_id: paymentId,
      delivery_channel: 'email',
    });
  }

  async createAlertNotification(
    userId: string,
    alertId: string,
    alertType: string,
    message: string,
  ) {
    await this.create(userId, {
      title: `Device Alert: ${alertType}`,
      body: message,
      type: NotificationType.WARNING,
      entity_type: 'alert',
      entity_id: alertId,
      delivery_channel: 'email',
    });
  }

  async createPaygLowBalanceNotification(
    userId: string,
    deviceId: string,
    balance: number,
    daysRemaining: number,
  ) {
    await this.create(userId, {
      title: 'Low PAYG Balance',
      body: `Your device PAYG balance is low (KES ${balance}). Only ${daysRemaining} days remaining. Please top up to avoid service interruption.`,
      type: NotificationType.WARNING,
      entity_type: 'device',
      entity_id: deviceId,
      delivery_channel: 'email',
    });
  }
}