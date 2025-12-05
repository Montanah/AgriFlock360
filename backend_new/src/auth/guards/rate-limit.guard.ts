import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RateLimitLog } from '../../database/entities/Rate-limit-log.entity';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(RateLimitLog)
    private rateLimitRepository: Repository<RateLimitLog>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const identifier = this.getIdentifier(request);
    const endpoint = `${request.method}:${request.route.path}`;

    const limits = {
      'POST:/api/v1/auth/login': { max: 5, window: 15 * 60 * 1000 }, // 5 per 15 min
      'POST:/api/v1/auth/register': { max: 3, window: 60 * 60 * 1000 }, // 3 per hour
      'POST:/api/v1/auth/forgot-password': { max: 3, window: 60 * 60 * 1000 },
      default: { max: 100, window: 60 * 1000 }, // 100 per minute
    };

    const limit = limits[endpoint] || limits.default;
    const windowStart = new Date(Date.now() - limit.window);

    const count = await this.rateLimitRepository.count({
      where: {
        identifier,
        endpoint,
        created_at: windowStart as any,
      },
    });

    if (count >= limit.max) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Log the request
    await this.rateLimitRepository.save({
      identifier,
      endpoint,
      ip_address: request.ip,
    });

    return true;
  }

  private getIdentifier(request: any): string {
    return request.user?.userId || request.ip;
  }
}
