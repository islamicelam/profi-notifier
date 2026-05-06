import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RmqModule } from '@app/rmq';
import { IDEMPOTENCY_STORE } from './idempotency.store';
import { RedisIdempotencyStore } from './redis-idempotency.store';
import { NotifierClient } from './notifier-client.service';
import { NotificationsProcessor } from './notifications.processor';
import { NotificationsHandler } from './notifications.handler';

@Module({
  imports: [HttpModule, RmqModule],
  providers: [
    {
      provide: IDEMPOTENCY_STORE,
      useClass: RedisIdempotencyStore,
    },
    NotifierClient,
    NotificationsProcessor,
    NotificationsHandler,
  ],
})
export class NotificationsModule {}
