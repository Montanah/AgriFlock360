// auth/guards/device-auth.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from '../../database/entities/Device.entity';
import { createHash } from 'crypto';

@Injectable()
export class DeviceAuthGuard implements CanActivate {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Extract API key from header
    const apiKey = request.headers['x-device-api-key'];
    
    if (!apiKey) {
      throw new UnauthorizedException('Device API key is required');
    }

    // Extract device ID from route params
    const deviceId = request.params.deviceId;
    
    if (!deviceId) {
      throw new UnauthorizedException('Device ID is required');
    }

    // Validate the API key
    const isValid = await this.validateDeviceApiKey(deviceId, apiKey);
    
    if (!isValid) {
      throw new UnauthorizedException('Invalid device API key');
    }

    // Attach device to request for use in controllers
    const device = await this.deviceRepository.findOne({
      where: { id: deviceId },
    });
    
    request.device = device;
    
    return true;
  }

  private async validateDeviceApiKey(
    deviceId: string,
    apiKey: string,
  ): Promise<boolean> {
    try {
      // Find device by ID
      const device = await this.deviceRepository.findOne({
        where: { id: deviceId },
        select: ['id', 'api_key_hash', 'device_status_id'],
        relations: ['device_status'],
      });

      if (!device) {
        return false;
      }

      // Check if device is active
      if (!device.device_status || device.device_status.name !== 'active') {
        return false;
      }

      // Hash the provided API key
      const hashedApiKey = this.hashApiKey(apiKey);

      // Compare with stored hash
      return hashedApiKey === device.api_key_hash;
    } catch (error) {
      console.error('Error validating device API key:', error);
      return false;
    }
  }

  private hashApiKey(apiKey: string): string {
    return createHash('sha256').update(apiKey).digest('hex');
  }
}
