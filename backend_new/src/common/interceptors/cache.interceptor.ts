import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisCacheService } from '../redis/redis-cache.service';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private redisCache: RedisCacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = this.generateCacheKey(request);

    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Try to get from cache
    const cachedResponse = await this.redisCache['redis'].get(cacheKey);
    
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // Execute request and cache response
    return next.handle().pipe(
      tap(async (response) => {
        await this.redisCache['redis'].set(cacheKey, response, 60); // 1 minute TTL
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const { url, user } = request;
    return `cache:${user?.userId || 'public'}:${url}`;
  }
}
