import { Module } from '@nestjs/common';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { RmqService } from './rmq.service';
import { rmqModuleAsyncOptions } from './rmq.config';

@Module({
  imports: [RabbitMQModule.forRootAsync(rmqModuleAsyncOptions)],
  providers: [RmqService],
  exports: [RabbitMQModule, RmqService],
})
export class RmqModule {}
