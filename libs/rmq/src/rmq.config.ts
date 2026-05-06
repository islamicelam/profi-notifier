import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  RabbitMQConfig,
  RabbitMQExchangeConfig,
} from '@golevelup/nestjs-rabbitmq';
import { EXCHANGES } from '@app/contracts';

const exchanges: RabbitMQExchangeConfig[] = [
  {
    name: EXCHANGES.EVENTS,
    type: 'topic',
    options: {
      durable: true,
    },
  },
];

export const rmqModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService): RabbitMQConfig => ({
    uri: config.getOrThrow<string>('RABBITMQ_URL'),
    exchanges,
    connectionInitOptions: {
      wait: true,
      timeout: 10000,
      reject: true,
    },
    enableControllerDiscovery: true,
  }),
};
