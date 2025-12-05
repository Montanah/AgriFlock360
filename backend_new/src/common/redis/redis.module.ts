import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisCacheService } from './redis-cache.service';
import { CustomLogger } from '../custom-logger.service';

@Global()
@Module({
  providers: [RedisService, RedisCacheService, CustomLogger],
  exports: [RedisService, RedisCacheService],
})
export class RedisModule {}
