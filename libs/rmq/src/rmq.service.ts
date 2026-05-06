import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

export interface PublishOptions {
  persistent?: boolean;
  messageId?: string;
  timestamp?: number;
}

@Injectable()
export class RmqService {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    @InjectPinoLogger(RmqService.name)
    private readonly logger: PinoLogger,
  ) {}

  async publish<T extends object>(
    exchange: string,
    routingKey: string,
    payload: T,
    options: PublishOptions = {},
  ): Promise<void> {
    const publishOptions = {
      persistent: options.persistent ?? true,
      messageId: options.messageId,
      timestamp: options.timestamp ?? Date.now(),
    };

    this.logger.debug(
      {
        exchange,
        routingKey,
        messageId: publishOptions.messageId,
      },
      'Publishing message to exchange',
    );

    try {
      await this.amqpConnection.publish(
        exchange,
        routingKey,
        payload,
        publishOptions,
      );

      this.logger.info(
        {
          exchange,
          routingKey,
          messageId: publishOptions.messageId,
        },
        'Message published successfully',
      );
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        {
          exchange,
          routingKey,
          messageId: publishOptions.messageId,
          err,
        },
        'Failed to publish message',
      );
      throw err;
    }
  }
}
