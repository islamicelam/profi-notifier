import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { NotificationChannel, NotificationEvent } from '@app/contracts';
import { retry } from '@app/common';
import { IDEMPOTENCY_STORE, type IdempotencyStore } from './idempotency.store';
import { NotifierClient } from './notifier-client.service';

@Injectable()
export class NotificationsProcessor {
  constructor(
    @Inject(IDEMPOTENCY_STORE)
    private readonly idempotency: IdempotencyStore,
    private readonly notifierClient: NotifierClient,
    @InjectPinoLogger(NotificationsProcessor.name)
    private readonly logger: PinoLogger,
  ) {}

  async process(rawMessage: unknown): Promise<void> {
    const event = await this.toValidEvent(rawMessage);

    const isNew = await this.idempotency.markIfNotSeen(event.eventId);
    if (!isNew) {
      this.logger.info(
        { eventId: event.eventId },
        'Event already processed, skipping (idempotency)',
      );
      return;
    }

    if (event.channel !== NotificationChannel.TELEGRAM) {
      this.logger.warn(
        { eventId: event.eventId, channel: event.channel },
        'Unsupported channel, skipping',
      );
      return;
    }

    await retry(
      () =>
        this.notifierClient.send({
          chatId: event.payload.chatId,
          message: event.payload.message,
        }),
      {
        maxAttempts: 3,
        baseDelayMs: 500,
        onRetry: (err, attempt, nextDelayMs) => {
          this.logger.warn(
            { eventId: event.eventId, attempt, nextDelayMs, err },
            'Notifier call failed, retrying',
          );
        },
      },
    );

    this.logger.info(
      { eventId: event.eventId },
      'Event processed successfully',
    );
  }

  private async toValidEvent(rawMessage: unknown): Promise<NotificationEvent> {
    const event = plainToInstance(NotificationEvent, rawMessage);
    await validateOrReject(event, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    return event;
  }
}
