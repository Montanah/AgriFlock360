// devices/services/firmware.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import * as multer from 'multer';
import { Express } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirmwareVersion } from '../database/entities/Firmware.entity';
import { CreateFirmwareDto } from './dto/create-firmware.dto';
import { CustomLogger } from '../common/custom-logger.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as AWS from 'aws-sdk';

@Injectable()
export class FirmwareService {
  private s3: AWS.S3;

  constructor(
    @InjectRepository(FirmwareVersion)
    private firmwareRepository: Repository<FirmwareVersion>,
    private logger: CustomLogger,
    private configService: ConfigService,
  ) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID')!,
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY')!,
      region: this.configService.get('AWS_REGION')!,
    });
  }

  async uploadFirmware(
    file: Express.Multer.File,
    createFirmwareDto: CreateFirmwareDto,
  ): Promise<FirmwareVersion> {
    // Check if version already exists
    const existing = await this.firmwareRepository.findOne({
      where: {
        version: createFirmwareDto.version,
        device_type: createFirmwareDto.device_type,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Firmware version ${createFirmwareDto.version} already exists`,
      );
    }

    // Calculate file hash
    const fileHash = crypto
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    // Upload to S3
    const fileName = `firmware/${createFirmwareDto.device_type}/${createFirmwareDto.version}.bin`;
    const uploadResult = await this.s3
      .upload({
        Bucket: this.configService.get('AWS_S3_BUCKET')!,
        Key: fileName,
        Body: file.buffer,
        ContentType: 'application/octet-stream',
        Metadata: {
          version: createFirmwareDto.version,
          deviceType: createFirmwareDto.device_type,
          checksum: fileHash,
        },
      })
      .promise();

    // Create firmware record
    const firmware = this.firmwareRepository.create({
      ...createFirmwareDto,
      file_url: uploadResult.Location,
      file_hash: fileHash,
      file_size: file.size,
      status: 'draft',
    });

    await this.firmwareRepository.save(firmware);

    this.logger.log(
      `Firmware uploaded: ${createFirmwareDto.version} for ${createFirmwareDto.device_type}`,
    );

    return firmware;
  }

  async releaseFirmware(firmwareId: string): Promise<FirmwareVersion> {
    const firmware = await this.firmwareRepository.findOne({
      where: { id: firmwareId },
    });

    if (!firmware) {
      throw new NotFoundException('Firmware not found');
    }

    if (firmware.status === 'released') {
      throw new BadRequestException('Firmware already released');
    }

    firmware.status = 'released';
    firmware.released_at = new Date();

    await this.firmwareRepository.save(firmware);

    this.logger.log(`Firmware released: ${firmware.version}`);

    return firmware;
  }

  async getLatestFirmware(
    deviceType: string,
    currentVersion?: string,
    releaseType: string = 'stable',
  ): Promise<FirmwareVersion | null> {
    const query = this.firmwareRepository
      .createQueryBuilder('firmware')
      .where('firmware.device_type = :deviceType', { deviceType })
      .andWhere('firmware.status = :status', { status: 'released' })
      .andWhere('firmware.release_type = :releaseType', { releaseType })
      .orderBy('firmware.released_at', 'DESC');

    if (currentVersion) {
      // Only get firmware newer than current version
      query.andWhere('firmware.version > :currentVersion', { currentVersion });
    }

    return await query.getOne();
  }

  async getAllFirmware(deviceType?: string) {
    const query = this.firmwareRepository.createQueryBuilder('firmware');

    if (deviceType) {
      query.where('firmware.device_type = :deviceType', { deviceType });
    }

    query.orderBy('firmware.released_at', 'DESC');

    return await query.getMany();
  }

  async checkForUpdate(
    deviceType: string,
    currentVersion: string,
  ): Promise<{
    update_available: boolean;
    latest_version?: FirmwareVersion;
    is_mandatory?: boolean;
  }> {
    const latestFirmware = await this.getLatestFirmware(
      deviceType,
      currentVersion,
      'stable',
    );

    if (!latestFirmware) {
      return { update_available: false };
    }

    // Check if device meets minimum version requirement
    if (latestFirmware.min_version) {
      if (
        this.compareVersions(currentVersion, latestFirmware.min_version) < 0
      ) {
        this.logger.warn(
          `Device version ${currentVersion} below minimum ${latestFirmware.min_version}`,
        );
        return { update_available: false };
      }
    }

    // Check rollout percentage (gradual rollout)
    const rolloutPercentage =
      latestFirmware.metadata?.rollout_percentage || 100;
    if (rolloutPercentage < 100) {
      // Use device-specific hash for consistent rollout
      const deviceHash = parseInt(
        crypto
          .createHash('md5')
          .update(deviceType)
          .digest('hex')
          .substring(0, 8),
        16,
      );
      if (deviceHash % 100 >= rolloutPercentage) {
        return { update_available: false };
      }
    }

    return {
      update_available: true,
      latest_version: latestFirmware,
      is_mandatory: latestFirmware.is_mandatory,
    };
  }

  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }
}
