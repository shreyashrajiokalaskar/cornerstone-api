import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: Number(this.configService.get('REDIS_PORT')),
      password: this.configService.get('REDIS_PASSWORD') || undefined,
    });
    this.logger.log('Redis client initialized');
  }

  async set(key: string, value: unknown, ttl?: number) {
    this.logger.debug('Redis SET', { key, ttl });
    if (ttl) {
      return await this.client.set(key, JSON.stringify(value), 'EX', ttl);
    }
    return await this.client.set(key, JSON.stringify(value));
  }

  async get<T>(key: string): Promise<T | null> {
    this.logger.debug('Redis GET', key);
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string) {
    this.logger.debug('Redis DEL', key);
    return await this.client.del(key);
  }

  onModuleDestroy() {
    this.logger.log('Shutting down Redis client');
    return this.client.quit();
  }
}
