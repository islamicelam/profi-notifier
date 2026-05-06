import { Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateNotificationDto,
  EXCHANGES,
  NotificationChannel,
  NotificationEvent,
  ROUTING_KEYS,
} from '@app/contracts';
import { RmqService } from '@app/rmq';
import { retry } from '@app/common';

const EVENT_SCHEMA_VERSION = 1;

const ROUTING_KEY_BY_CHANNEL: Record<NotificationChannel, string> = {
  [NotificationChannel.TELEGRAM]: ROUTING_KEYS.NOTIFICATION_TELEGRAM,
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly rmqService: RmqService,
    @InjectPinoLogger(NotificationsService.name)
    private readonly logger: PinoLogger,
  ) {}

  async publish(dto: CreateNotificationDto): Promise<{ eventId: string }> {
    const event: NotificationEvent = {
      eventId: uuidv4(),
      channel: dto.channel,
      payload: dto.payload,
      occurredAt: new Date().toISOString(),
      version: EVENT_SCHEMA_VERSION,
    };

    const routingKey = ROUTING_KEY_BY_CHANNEL[event.channel];

    this.logger.info(
      { eventId: event.eventId, channel: event.channel },
      'Accepted notification request, publishing event',
    );

    await retry(
      () =>
        this.rmqService.publish(EXCHANGES.EVENTS, routingKey, event, {
          messageId: event.eventId,
        }),
      {
        maxAttempts: 3,
        baseDelayMs: 200,
        onRetry: (err, attempt, nextDelayMs) => {
          this.logger.warn(
            {
              eventId: event.eventId,
              attempt,
              nextDelayMs,
              err,
            },
            'Publish attempt failed, retrying',
          );
        },
      },
    );

    return { eventId: event.eventId };
  }
}
