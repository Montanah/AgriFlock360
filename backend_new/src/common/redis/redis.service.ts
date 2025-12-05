// common/redis/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { CustomLogger } from '../custom-logger.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private publisher: RedisClientType;
  private subscriber: RedisClientType;

  constructor(
    private configService: ConfigService,
    private logger: CustomLogger,
  ) {}

  async onModuleInit() {
    // Main client for commands
    this.client = createClient({
      url: this.configService.get('REDIS_URL') || 'redis://localhost:6379',
      password: this.configService.get('REDIS_PASSWORD'),
    });

    // Publisher for pub/sub
    this.publisher = this.client.duplicate();

    // Subscriber for pub/sub
    this.subscriber = this.client.duplicate();

    await this.client.connect();
    await this.publisher.connect();
    await this.subscriber.connect();

    this.logger.log('Redis connected successfully');

    this.client.on('error', (err) => {
      this.logger.error('Redis Client Error', err);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.publisher.quit();
    await this.subscriber.quit();
  }

  getClient(): RedisClientType {
    return this.client;
  }

  getPublisher(): RedisClientType {
    return this.publisher;
  }

  getSubscriber(): RedisClientType {
    return this.subscriber;
  }

  // Generic set with TTL
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    if (ttl) {
      await this.client.setEx(key, ttl, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  // Generic get with JSON parse
  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as any;
    }
  }

  // Delete key
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // Increment counter
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  // Set expiry on existing key
  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  // Hash operations
  async hSet(key: string, field: string, value: any): Promise<void> {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.hSet(key, field, stringValue);
  }

  async hGet(key: string, field: string): Promise<any> {
    const value = await this.client.hGet(key, field);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  async hGetAll(key: string): Promise<Record<string, any>> {
    const data = await this.client.hGetAll(key);
    const parsed: Record<string, any> = {};

    for (const [field, value] of Object.entries(data)) {
      try {
        parsed[field] = JSON.parse(value);
      } catch {
        parsed[field] = value;
      }
    }

    return parsed;
  }

  // List operations
  async lPush(key: string, value: any): Promise<void> {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.lPush(key, stringValue);
  }

  async rPush(key: string, value: any): Promise<void> {
    const stringValue =
      typeof value === 'string' ? value : JSON.stringify(value);
    await this.client.rPush(key, stringValue);
  }

  async lPop(key: string): Promise<any> {
    const value = await this.client.lPop(key);
    if (!value) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  async lRange(key: string, start: number, stop: number): Promise<any[]> {
    const values = await this.client.lRange(key, start, stop);
    return values.map((v) => {
      try {
        return JSON.parse(v);
      } catch {
        return v;
      }
    });
  }

  async lLen(key: string): Promise<number> {
    return await this.client.lLen(key);
  }

  // Set operations
  async sAdd(key: string, member: string): Promise<void> {
    await this.client.sAdd(key, member);
  }

  async sMembers(key: string): Promise<string[]> {
    return await this.client.sMembers(key);
  }

  async sRem(key: string, member: string): Promise<void> {
    await this.client.sRem(key, member);
  }

  // Pub/Sub
  async publish(channel: string, message: any): Promise<void> {
    const stringMessage =
      typeof message === 'string' ? message : JSON.stringify(message);
    await this.publisher.publish(channel, stringMessage);
  }

  async subscribe(
    channel: string,
    callback: (message: any) => void,
  ): Promise<void> {
    await this.subscriber.subscribe(channel, (message) => {
      try {
        callback(JSON.parse(message));
      } catch {
        callback(message);
      }
    });
  }

  // Pattern matching
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }
}
