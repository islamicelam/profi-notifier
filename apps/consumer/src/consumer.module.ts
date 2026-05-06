import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { ConsumerController } from './consumer.controller';
import { ConsumerService } from './consumer.service';
import { AppConfigModule, loggerModuleAsyncOptions } from '@app/common';
import { RmqModule } from '@app/rmq';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync(loggerModuleAsyncOptions),
    RmqModule,
  ],
  controllers: [ConsumerController],
  providers: [ConsumerService],
})
export class ConsumerModule {}
