import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisCacheService } from '../../common/redis/redis-cache.service';

@Injectable()
export class RedisRateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private redisCache: RedisCacheService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const endpoint = `${request.method}:${request.route.path}`;

    if (!user) {
      return true; // Public endpoints handle their own rate limiting
    }

    const { allowed, remaining } = await this.redisCache.checkRateLimit(
      user.userId,
      endpoint,
      100, // 100 requests
      60,  // per minute
    );

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', '100');
    response.setHeader('X-RateLimit-Remaining', remaining.toString());

    if (!allowed) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}

