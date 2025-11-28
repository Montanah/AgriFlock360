import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../common/redis/redis.service';
import { RedisCacheService } from '../common/redis/redis-cache.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IssuedDeviceCommand } from '../database/entities/IssuedDeviceCommand.entity';
import { CustomLogger } from '../common/custom-logger.service';

@Injectable()
export class MqttSubscriberService implements OnModuleInit {
  constructor(
    private redis: RedisService,
    private redisCache: RedisCacheService,
    @InjectRepository(IssuedDeviceCommand)
    private commandRepository: Repository<IssuedDeviceCommand>,
    private logger: CustomLogger,
  ) {}

  async onModuleInit() {
    // Subscribe to command acknowledgments
    await this.subscribeToCommandAcks();
    
    // Subscribe to device heartbeats
    await this.subscribeToHeartbeats();
  }

  private async subscribeToCommandAcks() {
    await this.redis.subscribe('mqtt:command:ack:*', async (message: any) => {
      const { command_id, status, response } = message;

      // Update Redis status
      await this.redisCache.setCommandStatus(command_id, status, {
        acknowledged_at: new Date().toISOString(),
        response: JSON.stringify(response),
      });

      // Update database
      await this.commandRepository.update(command_id, {
        command_status: status,
        acknowledged_at: new Date(),
        response,
      });

      this.logger.log(`Command ${command_id} acknowledged with status: ${status}`);
    });
  }

  private async subscribeToHeartbeats() {
    await this.redis.subscribe('mqtt:heartbeat', async (message: any) => {
      const { device_id } = message;
      
      // Update device online status
      await this.redisCache.setDeviceOnline(device_id);
      
      this.logger.log(`Heartbeat received from device ${device_id}`);
    });
  }
}