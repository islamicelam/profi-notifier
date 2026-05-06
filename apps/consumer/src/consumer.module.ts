import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { AppConfigModule, loggerModuleAsyncOptions } from '@app/common';
import { RmqModule } from '@app/rmq';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync(loggerModuleAsyncOptions),
    RmqModule,
    NotificationsModule,
  ],
  controllers: [ConsumerController],
  providers: [ConsumerService],
})
export class ConsumerModule {}
