import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import Redis from 'ioredis';
import { IdempotencyStore } from './idempotency.store';

const TTL_SECONDS = 24 * 60 * 60; // 24 hours
const KEY_PREFIX = 'idempotency:notification:';

@Injectable()
export class RedisIdempotencyStore
  implements IdempotencyStore, OnModuleDestroy
{
  private readonly redis: Redis;

  constructor(
    config: ConfigService,
    @InjectPinoLogger(RedisIdempotencyStore.name)
    private readonly logger: PinoLogger,
  ) {
    this.redis = new Redis({
      host: config.getOrThrow<string>('REDIS_HOST'),
      port: config.getOrThrow<number>('REDIS_PORT'),
      password: config.get<string>('REDIS_PASSWORD') || undefined,
      db: config.getOrThrow<number>('REDIS_DB'),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    });

    this.redis.on('connect', () => {
      this.logger.info('Connected to Redis');
    });

    this.redis.on('error', (err) => {
      this.logger.error({ err }, 'Redis connection error');
    });
  }

  async markIfNotSeen(eventId: string): Promise<boolean> {
    const key = `${KEY_PREFIX}${eventId}`;

    // SET key value NX EX <seconds>:
    // - NX: set only if key does not exist (atomic)
    // - EX: expire after N seconds
    // Returns 'OK' if set, null if key already existed.
    const result = await this.redis.set(key, '1', 'EX', TTL_SECONDS, 'NX');

    return result === 'OK';
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
