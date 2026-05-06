import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  AmqpConnection,
  MessageHandlerErrorBehavior,
  RabbitSubscribe,
} from '@golevelup/nestjs-rabbitmq';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { BINDING_PATTERNS, EXCHANGES, QUEUES } from '@app/contracts';
import { NotificationsProcessor } from './notifications.processor';

@Injectable()
export class NotificationsHandler implements OnApplicationBootstrap {
  constructor(
    private readonly processor: NotificationsProcessor,
    private readonly amqpConnection: AmqpConnection,
    @InjectPinoLogger(NotificationsHandler.name)
    private readonly logger: PinoLogger,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.amqpConnection.channel.assertQueue(QUEUES.NOTIFICATIONS_DLQ, {
      durable: true,
    });
    this.logger.info(
      { queue: QUEUES.NOTIFICATIONS_DLQ },
      'Dead-letter queue asserted',
    );
  }

  @RabbitSubscribe({
    exchange: EXCHANGES.EVENTS,
    routingKey: BINDING_PATTERNS.ALL_NOTIFICATIONS,
    queue: QUEUES.NOTIFICATIONS,
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': QUEUES.NOTIFICATIONS_DLQ,
      },
    },
    errorBehavior: MessageHandlerErrorBehavior.NACK,
  })
  async handle(rawMessage: unknown): Promise<void> {
    try {
      await this.processor.process(rawMessage);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        { err },
        'Failed to process notification, sending to DLQ',
      );
      throw err;
    }
  }
}
