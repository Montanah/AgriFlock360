// devices/services/ota.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { OtaUpdate } from '../database/entities/OtaUpdate.entity';
import { Device } from '../database/entities/Device.entity';
import { FirmwareVersion } from '../database/entities/Firmware.entity';
import { ScheduleOtaDto } from './dto/schedule-ota.dto';
import { OtaProgressDto } from './dto/ota-progress.dto';
import { RedisCacheService } from '../common/redis/redis-cache.service';
import { CustomLogger } from '../common/custom-logger.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OtaService {
  constructor(
    @InjectRepository(OtaUpdate)
    private otaRepository: Repository<OtaUpdate>,
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
    @InjectRepository(FirmwareVersion)
    private firmwareRepository: Repository<FirmwareVersion>,
    private redisCache: RedisCacheService,
    private logger: CustomLogger,
  ) {}

  async scheduleUpdate(scheduleOtaDto: ScheduleOtaDto): Promise<OtaUpdate[]> {
    const firmware = await this.firmwareRepository.findOne({
      where: { id: scheduleOtaDto.firmware_id },
    });

    if (!firmware) {
      throw new NotFoundException('Firmware not found');
    }

    // Get devices to update
    let devices: Device[];
    if (scheduleOtaDto.device_ids && scheduleOtaDto.device_ids.length > 0) {
      devices = await this.deviceRepository.find({
        where: { id: In(scheduleOtaDto.device_ids) },
      });
    } else {
      // Update all devices of this type
      devices = await this.deviceRepository.find({
        where: { device_type: firmware.device_type as any },
      });
    }

    const scheduledAt = scheduleOtaDto.scheduled_at
      ? new Date(scheduleOtaDto.scheduled_at)
      : new Date();

    const otaUpdates: OtaUpdate[] = [];

    for (const device of devices) {
      // Check if update already scheduled
      const existing = await this.otaRepository.findOne({
        where: {
          device_id: device.id,
          firmware_id: firmware.id,
          status: In(['pending', 'downloading', 'installing']),
        },
      });

      if (existing) {
        this.logger.warn(
          `OTA already scheduled for device ${device.device_id}`,
        );
        continue;
      }

      const otaUpdate = this.otaRepository.create({
        device_id: device.id,
        firmware_id: firmware.id,
        current_version: device.firmware_version?.version,
        target_version: firmware.version,
        status: 'pending',
        scheduled_at: scheduledAt,
      });

      await this.otaRepository.save(otaUpdate);
      otaUpdates.push(otaUpdate);

      // Queue OTA command to device via Redis
      await this.redisCache.queueCommand(device.id, {
        command_id: otaUpdate.id,
        type: 'ota_update',
        payload: {
          firmware_url: firmware.file_url,
          version: firmware.version,
          checksum: firmware.file_hash,
          size: firmware.file_size,
        },
        scheduled_at: scheduledAt,
      });

      this.logger.log(
        `OTA scheduled: Device ${device.device_id} → v${firmware.version}`,
      );
    }

    return otaUpdates;
  }

  async updateProgress(
    deviceId: string,
    otaId: string,
    progressDto: OtaProgressDto,
  ): Promise<void> {
    const otaUpdate = await this.otaRepository.findOne({
      where: { id: otaId, device_id: deviceId },
    });

    if (!otaUpdate) {
      throw new NotFoundException('OTA update not found');
    }

    otaUpdate.status = progressDto.status;
    otaUpdate.progress = progressDto.progress;

    if (progressDto.status === 'downloading' && !otaUpdate.started_at) {
      otaUpdate.started_at = new Date();
    }

    if (progressDto.status === 'completed') {
      otaUpdate.completed_at = new Date();
      otaUpdate.progress = 100;

      // Update device firmware version
      await this.deviceRepository.update(deviceId, {
        firmware_version_id: otaUpdate.firmware_id,
      });

      this.logger.log(
        `OTA completed: Device ${deviceId} → v${otaUpdate.target_version}`,
      );
    }

    if (progressDto.status === 'failed') {
      otaUpdate.error_message = progressDto.message || 'OTA update failed';
      otaUpdate.retry_count += 1;

      this.logger.error(
        `OTA failed: Device ${deviceId} - ${progressDto.message || 'OTA update failed'}`,
      );
    }

    await this.otaRepository.save(otaUpdate);

    // Cache status in Redis for real-time tracking
    await this.redisCache['redis'].set(
      `ota:status:${otaId}`,
      {
        status: progressDto.status,
        progress: progressDto.progress,
        updated_at: new Date(),
      },
      300, // 5 minutes TTL
    );
  }

  async getDeviceOtaHistory(deviceId: string) {
    const updates = await this.otaRepository.find({
      where: { device_id: deviceId },
      relations: ['firmware'],
      order: { created_at: 'DESC' },
      take: 10,
    });

    return { updates };
  }

  async getOtaStatus(otaId: string) {
    // Try Redis cache first for real-time status
    const cached = await this.redisCache['redis'].get(`ota:status:${otaId}`);
    if (cached) {
      return cached;
    }

    // Fallback to database
    const otaUpdate = await this.otaRepository.findOne({
      where: { id: otaId },
      relations: ['device', 'firmware'],
    });

    if (!otaUpdate) {
      throw new NotFoundException('OTA update not found');
    }

    return otaUpdate;
  }

  async cancelUpdate(otaId: string): Promise<void> {
    const otaUpdate = await this.otaRepository.findOne({
      where: { id: otaId },
    });

    if (!otaUpdate) {
      throw new NotFoundException('OTA update not found');
    }

    if (['completed', 'failed', 'cancelled'].includes(otaUpdate.status)) {
      throw new BadRequestException('Cannot cancel completed or failed update');
    }

    otaUpdate.status = 'cancelled';
    await this.otaRepository.save(otaUpdate);

    // Send cancel command to device
    await this.redisCache.queueCommand(otaUpdate.device_id, {
      command_id: otaUpdate.id,
      type: 'cancel_ota',
      payload: {},
    });

    this.logger.log(`OTA cancelled: ${otaId}`);
  }

  // Auto-retry failed OTA updates
  @Cron(CronExpression.EVERY_HOUR)
  async retryFailedUpdates() {
    const failedUpdates = await this.otaRepository.find({
      where: {
        status: 'failed',
        retry_count: In([0, 1, 2]), // Max 3 retries
      },
      relations: ['device', 'firmware'],
    });

    for (const update of failedUpdates) {
      // Wait 1 hour between retries
      const hoursSinceFailed =
        (Date.now() - update.updated_at.getTime()) / (1000 * 60 * 60);

      if (hoursSinceFailed >= 1) {
        update.status = 'pending';
        await this.otaRepository.save(update);

        // Re-queue command
        await this.redisCache.queueCommand(update.device_id, {
          command_id: update.id,
          type: 'ota_update',
          payload: {
            firmware_url: update.firmware.file_url,
            version: update.firmware.version,
            checksum: update.firmware.file_hash,
            size: update.firmware.file_size,
          },
        });

        this.logger.log(
          `OTA retry queued: ${update.id} (attempt ${update.retry_count + 1})`,
        );
      }
    }
  }

  async getOtaStats() {
    const [total, pending, completed, failed, inProgress] = await Promise.all([
      this.otaRepository.count(),
      this.otaRepository.count({ where: { status: 'pending' } }),
      this.otaRepository.count({ where: { status: 'completed' } }),
      this.otaRepository.count({ where: { status: 'failed' } }),
      this.otaRepository.count({
        where: { status: In(['downloading', 'installing']) },
      }),
    ]);

    const successRate =
      total > 0
        ? ((completed / (completed + failed)) * 100).toFixed(2)
        : '0.00';

    return {
      total,
      pending,
      completed,
      failed,
      in_progress: inProgress,
      success_rate: `${successRate}%`,
    };
  }
}
