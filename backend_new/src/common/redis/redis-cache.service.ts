// common/redis/redis-cache.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';
import { CustomLogger } from '../custom-logger.service';

export interface TelemetryCache {
  temperature: number;
  humidity: number;
  heater_status: boolean;
  fan_status: boolean;
  power_status: boolean;
  timestamp: Date;
}

export interface DeviceInfo {
  id: string;
  device_id: string;
  device_name: string;
  owner_id: string;
  status: string;
  is_payg_locked: boolean;
  payg_balance: number;
}

export interface PaygBalance {
  balance: number;
  daily_rate: number;
  last_deduction: Date;
  is_locked: boolean;
}

@Injectable()
export class RedisCacheService {
  constructor(
    private redis: RedisService,
    private logger: CustomLogger,
  ) {}

  // TELEMETRY CACHING
  async cacheLatestTelemetry(
    deviceId: string,
    telemetry: TelemetryCache,
  ): Promise<void> {
    const key = `telemetry:latest:${deviceId}`;
    await this.redis.set(key, telemetry, 300); // 5 minutes TTL
    this.logger.log(`Cached telemetry for device ${deviceId}`);
  }

  async getLatestTelemetry(deviceId: string): Promise<TelemetryCache | null> {
    const key = `telemetry:latest:${deviceId}`;
    return await this.redis.get<TelemetryCache>(key);
  }

  async cacheTelemetryStats(
    deviceId: string,
    period: '1h' | '24h' | '7d',
    stats: any,
  ): Promise<void> {
    const key = `telemetry:stats:${deviceId}:${period}`;
    await this.redis.set(key, stats, 3600); // 1 hour TTL
  }

  async getTelemetryStats(
    deviceId: string,
    period: '1h' | '24h' | '7d',
  ): Promise<any> {
    const key = `telemetry:stats:${deviceId}:${period}`;
    return await this.redis.get(key);
  }

  // Buffer telemetry for batch insertion
  async bufferTelemetry(deviceId: string, telemetry: any): Promise<void> {
    const key = `telemetry:buffer:${deviceId}`;
    await this.redis.rPush(key, telemetry);

    // Check buffer size
    const size = await this.redis.lLen(key);
    if (size >= 100) {
      // Trigger flush (handled by cron job or separate service)
      await this.redis.publish('telemetry:flush', { deviceId });
    }
  }

  async getTelemetryBuffer(deviceId: string): Promise<any[]> {
    const key = `telemetry:buffer:${deviceId}`;
    return await this.redis.lRange(key, 0, -1);
  }

  async clearTelemetryBuffer(deviceId: string): Promise<void> {
    const key = `telemetry:buffer:${deviceId}`;
    await this.redis.del(key);
  }

  // DEVICE COMMAND QUEUE
  async queueCommand(deviceId: string, command: any): Promise<void> {
    const key = `commands:pending:${deviceId}`;
    await this.redis.lPush(key, command);

    // Publish to MQTT channel
    const channel = `mqtt:commands:${deviceId}`;
    await this.redis.publish(channel, command);

    this.logger.log(`Queued command for device ${deviceId}: ${command.type}`);
  }

  async getPendingCommands(deviceId: string): Promise<any[]> {
    const key = `commands:pending:${deviceId}`;
    return await this.redis.lRange(key, 0, -1);
  }

  async popCommand(deviceId: string): Promise<any> {
    const key = `commands:pending:${deviceId}`;
    return await this.redis.lPop(key);
  }

  async setCommandStatus(
    commandId: string,
    status: string,
    metadata?: any,
  ): Promise<void> {
    const key = `commands:status:${commandId}`;
    await this.redis.hSet(key, 'status', status);
    await this.redis.hSet(key, 'updated_at', new Date().toISOString());

    if (metadata) {
      for (const [field, value] of Object.entries(metadata)) {
        await this.redis.hSet(key, field, value);
      }
    }

    await this.redis.expire(key, 86400); // 24 hours TTL
  }

  async getCommandStatus(commandId: string): Promise<any> {
    const key = `commands:status:${commandId}`;
    return await this.redis.hGetAll(key);
  }

  // DEVICE STATUS & HEARTBEAT
  async setDeviceOnline(deviceId: string): Promise<void> {
    const key = `device:online:${deviceId}`;
    await this.redis.set(key, 'true', 120); // 2 minutes TTL
  }

  async isDeviceOnline(deviceId: string): Promise<boolean> {
    const key = `device:online:${deviceId}`;
    const status = await this.redis.get(key);
    return status === 'true';
  }

  async cacheDeviceInfo(deviceId: string, info: DeviceInfo): Promise<void> {
    const key = `device:info:${deviceId}`;
    await this.redis.set(key, info, 900); // 15 minutes TTL
  }

  async getDeviceInfo(deviceId: string): Promise<DeviceInfo | null> {
    const key = `device:info:${deviceId}`;
    return await this.redis.get<DeviceInfo>(key);
  }

  // PAYG BALANCE CACHE
  async cachePaygBalance(
    deviceId: string,
    balance: PaygBalance,
  ): Promise<void> {
    const key = `payg:balance:${deviceId}`;
    await this.redis.set(key, balance, 300); // 5 minutes TTL
  }

  async getPaygBalance(deviceId: string): Promise<PaygBalance | null> {
    const key = `payg:balance:${deviceId}`;
    return await this.redis.get<PaygBalance>(key);
  }

  async invalidatePaygBalance(deviceId: string): Promise<void> {
    const key = `payg:balance:${deviceId}`;
    await this.redis.del(key);
  }

  // ALERT COUNTERS
  async incrementUnreadAlerts(userId: string): Promise<number> {
    const key = `alerts:unread:${userId}`;
    return await this.redis.incr(key);
  }

  async getUnreadAlertCount(userId: string): Promise<number> {
    const key = `alerts:unread:${userId}`;
    const count = await this.redis.get(key);
    return count ? parseInt(count as string) : 0;
  }

  async resetUnreadAlerts(userId: string): Promise<void> {
    const key = `alerts:unread:${userId}`;
    await this.redis.set(key, '0');
  }

  async addCriticalAlert(deviceId: string, alertType: string): Promise<void> {
    const key = `alerts:critical:${deviceId}`;
    await this.redis.sAdd(key, alertType);
  }

  async removeCriticalAlert(
    deviceId: string,
    alertType: string,
  ): Promise<void> {
    const key = `alerts:critical:${deviceId}`;
    await this.redis.sRem(key, alertType);
  }

  async getCriticalAlerts(deviceId: string): Promise<string[]> {
    const key = `alerts:critical:${deviceId}`;
    return await this.redis.sMembers(key);
  }

  // RATE LIMITING
  async checkRateLimit(
    userId: string,
    endpoint: string,
    limit: number = 100,
    window: number = 60,
  ): Promise<{ allowed: boolean; remaining: number }> {
    const key = `ratelimit:api:${userId}:${endpoint}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, window);
    }

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
    };
  }

  async checkPaymentRateLimit(userId: string): Promise<boolean> {
    const key = `ratelimit:payment:${userId}`;
    const current = await this.redis.incr(key);

    if (current === 1) {
      await this.redis.expire(key, 3600); // 1 hour
    }

    return current <= 10; // Max 10 payment initiations per hour
  }

  // SESSION CACHE
  async cacheSession(userId: string, session: any): Promise<void> {
    const key = `session:${userId}`;
    await this.redis.set(key, session, 86400); // 24 hours TTL
  }

  async getSession(userId: string): Promise<any> {
    const key = `session:${userId}`;
    return await this.redis.get(key);
  }

  async invalidateSession(userId: string): Promise<void> {
    const key = `session:${userId}`;
    await this.redis.del(key);
  }

  // NOTIFICATION QUEUE
  async queuePushNotification(notification: any): Promise<void> {
    const key = 'notifications:push:queue';
    await this.redis.lPush(key, notification);
  }

  async getPushNotifications(count: number = 10): Promise<any[]> {
    const key = 'notifications:push:queue';
    const notifications: any[] = [];

    for (let i = 0; i < count; i++) {
      const notification = await this.redis.lPop(key);
      if (!notification) break;
      notifications.push(notification);
    }

    return notifications;
  }

  async queueSmsNotification(notification: any): Promise<void> {
    const key = 'notifications:sms:queue';
    await this.redis.lPush(key, notification);
  }

  // PROVISIONING TOKENS
  async cacheProvisioningToken(token: string, data: any): Promise<void> {
    const key = `provisioning:token:${token}`;
    await this.redis.set(key, data, 3600); // 1 hour TTL
  }

  async getProvisioningToken(token: string): Promise<any> {
    const key = `provisioning:token:${token}`;
    return await this.redis.get(key);
  }

  async invalidateProvisioningToken(token: string): Promise<void> {
    const key = `provisioning:token:${token}`;
    await this.redis.del(key);
  }

  // UTILITY METHODS
  async clearCache(pattern: string): Promise<number> {
    const keys = await this.redis.keys(pattern);
    if (keys.length === 0) return 0;

    for (const key of keys) {
      await this.redis.del(key);
    }

    return keys.length;
  }

  async getCacheStats(): Promise<any> {
    const info = await this.redis.getClient().info('stats');
    return info;
  }
}
