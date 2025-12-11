// devices/telemetry.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Telemetry } from '../database/entities/Telemetry.entity';
import { Device } from '../database/entities/Device.entity';
import { Alert, AlertSeverity } from '../database/entities/Alert.entity';
import { CustomLogger } from '../common/custom-logger.service';
import { MqttTelemetryData } from '../mqtt/mqtt.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  RedisCacheService,
  TelemetryCache,
} from '../common/redis/redis-cache.service';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface TelemetryData {
  temperature?: number;
  humidity?: number;
  heater_status?: boolean;
  fan_status?: boolean;
  power_status?: boolean;
  error_code?: string;
  meta?: any;
}

@Injectable()
export class TelemetryService {
  constructor(
    @InjectRepository(Telemetry)
    private telemetryRepository: Repository<Telemetry>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(Alert)
    private alertRepository: Repository<Alert>,
    private logger: CustomLogger,
    private notificationsService: NotificationsService,
    private redisCache: RedisCacheService,
  ) {}

  async recordTelemetry(deviceId: string, data: TelemetryData) {
    // Cache in Redis
    await this.redisCache.cacheLatestTelemetry(deviceId, {
      ...data,
      timestamp: new Date(),
    } as TelemetryCache);

    // update device heartbeat
    await this.redisCache.setDeviceOnline(deviceId);

    // buffer for batch insertion
    await this.redisCache.bufferTelemetry(deviceId, {
      ...data,
      device_id: deviceId,
      timestamp: new Date(),
    });

    //update device last_seen in background
    this.updateDeviceLastSeen(deviceId);

    // Process MQTT telemetry
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new Error('Device not found');
    }

    const telemetry = this.telemetryRepository.create({
      device_id: deviceId,
      ...data,
    });

    await this.telemetryRepository.save(telemetry);

    // Update device last_seen
    device.last_seen = new Date();
    await this.deviceRepository.save(device);

    // Check for alerts
    await this.checkAlertConditions(device, data);

    return telemetry;
  }

  async getLatestTelemetry(deviceId: string) {
    // Try Redis cache first
    const telemetry = await this.redisCache.getLatestTelemetry(deviceId);

    if (telemetry) {
      return telemetry;
    }

    // return this.telemetryRepository.findOne({
    //   where: { device_id: deviceId },
    //   order: { timestamp: 'DESC' },
    // });
    // Fallback to database
    const dbTelemetry = await this.telemetryRepository.findOne({
      where: { device_id: deviceId },
      order: { timestamp: 'DESC' },
    });

    if (dbTelemetry) {
      // Cache it
      await this.redisCache.cacheLatestTelemetry(deviceId, dbTelemetry as any);
      return dbTelemetry;
    }

    return null;
  }

  async getTelemetryHistory(
    deviceId: string,
    startDate: Date,
    endDate: Date,
    limit = 100,
  ) {
    return this.telemetryRepository.find({
      where: {
        device_id: deviceId,
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getAggregatedTelemetry(deviceId: string, interval: '1h' | '1d' | '1w') {
    // This would typically use raw SQL for aggregation
    // For now, return basic query
    const hours = interval === '1h' ? 1 : interval === '1d' ? 24 : 168;
    const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    const telemetry = await this.telemetryRepository.find({
      where: {
        device_id: deviceId,
        timestamp: Between(startDate, new Date()) as any,
      },
      order: { timestamp: 'ASC' },
    });

    // Calculate averages
    const avgTemp =
      telemetry.reduce((sum, t) => sum + (Number(t.temperature) || 0), 0) /
      telemetry.length;
    const avgHumidity =
      telemetry.reduce((sum, t) => sum + (Number(t.humidity) || 0), 0) /
      telemetry.length;

    return {
      device_id: deviceId,
      interval,
      period: { start: startDate, end: new Date() },
      data: telemetry,
      aggregates: {
        avg_temperature: avgTemp.toFixed(2),
        avg_humidity: avgHumidity.toFixed(2),
        data_points: telemetry.length,
      },
    };
  }

  private async checkAlertConditions(device: Device, data: TelemetryData) {
    const alerts: Array<{
      device_id: string;
      user_id?: string;
      severity: AlertSeverity;
      alert_type: string;
      message: string;
      meta?: any;
    }> = [];

    // High temperature alert
    if (data.temperature && data.temperature > 35) {
      alerts.push({
        device_id: device.id,
        user_id: device.owner_id,
        severity: 'high',
        alert_type: 'high_temperature',
        message: `High temperature detected: ${data.temperature}°C`,
        meta: { temperature: data.temperature },
      });
    }

    // Low temperature alert
    if (data.temperature && data.temperature < 25) {
      alerts.push({
        device_id: device.id,
        user_id: device.owner_id,
        severity: 'medium',
        alert_type: 'low_temperature',
        message: `Low temperature detected: ${data.temperature}°C`,
        meta: { temperature: data.temperature },
      });
    }

    // High humidity alert
    if (data.humidity && data.humidity > 80) {
      alerts.push({
        device_id: device.id,
        user_id: device.owner_id,
        severity: 'medium',
        alert_type: 'high_humidity',
        message: `High humidity detected: ${data.humidity}%`,
        meta: { humidity: data.humidity },
      });
    }

    // Power failure alert
    if (data.power_status === false) {
      alerts.push({
        device_id: device.id,
        user_id: device.owner_id,
        severity: 'high',
        alert_type: 'power_failure',
        message: 'Power failure detected',
        meta: {},
      });
    }

    // Error code alert
    if (data.error_code) {
      alerts.push({
        device_id: device.id,
        user_id: device.owner_id,
        severity: 'high',
        alert_type: 'device_error',
        message: `Device error: ${data.error_code}`,
        meta: { error_code: data.error_code },
      });
    }

    // Save alerts
    for (const alertData of alerts) {
      // Check if similar alert already exists and is active
      const existingAlert = await this.alertRepository.findOne({
        where: {
          device_id: alertData.device_id,
          alert_type: alertData.alert_type,
          alert_status: 'active',
        },
      });

      if (!existingAlert) {
        const alert = this.alertRepository.create(alertData);
        await this.alertRepository.save(alert);
        this.logger.warn(
          `Alert created: ${alertData.alert_type} for device ${device.device_id}`,
        );
      }
    }

    // Send notifications for created alerts
    for (const alertData of alerts) {
      const alert = this.alertRepository.create(alertData);
      await this.alertRepository.save(alert);

      // Send notification
      if (device.owner_id) {
        await this.notificationsService.createAlertNotification(
          device.owner_id,
          alert.id,
          alert.alert_type,
          alert.message,
        );
      }
    }
  }

  async processMqttTelemetry(deviceId: string, data: MqttTelemetryData) {
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });

    if (!device) {
      throw new Error('Device not found');
    }

    const telemetry = this.telemetryRepository.create({
      device_id: deviceId,
      temperature: data.temperature,
      humidity: data.humidity,
      heater_status: data.heater_status,
      fan_status: data.fan_status,
      power_status: data.power_status,
      error_code: data.error_code,
      meta: {
        ...data.meta,
        rssi: data.rssi,
        battery: data.battery,
        status: data.status,
        received_via: 'mqtt',
      },
    });

    await this.telemetryRepository.save(telemetry);

    // Update device last_seen
    device.last_seen = new Date();
    await this.deviceRepository.save(device);

    // Check for alerts
    await this.checkAlertConditions(device, {
      temperature: data.temperature,
      humidity: data.humidity,
      heater_status: data.heater_status,
      fan_status: data.fan_status,
      power_status: data.power_status,
      error_code: data.error_code,
      meta: data.meta,
    });

    return telemetry;
  }

  // Flush buffered telemetry to database every 5 minutes
  @Cron(CronExpression.EVERY_5_MINUTES)
  async flushTelemetryBuffers() {
    this.logger.log('Flushing telemetry buffers to database');

    // Get all buffer keys
    const bufferKeys =
      await this.redisCache['redis'].keys('telemetry:buffer:*');

    for (const key of bufferKeys) {
      const deviceId = key.split(':')[2];
      const buffer = await this.redisCache.getTelemetryBuffer(deviceId);

      if (buffer.length === 0) continue;

      try {
        // Batch insert to database
        await this.telemetryRepository.insert(buffer);

        // Clear buffer
        await this.redisCache.clearTelemetryBuffer(deviceId);

        this.logger.log(
          `Flushed ${buffer.length} telemetry records for device ${deviceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to flush telemetry for device ${deviceId}`,
          error.stack,
        );
      }
    }
  }

  private async updateDeviceLastSeen(deviceId: string) {
    try {
      await this.deviceRepository.update(deviceId, {
        last_seen: new Date(),
      });
    } catch (error) {
      this.logger.error(`Failed to update device last_seen: ${error.message}`);
    }
  }
}
