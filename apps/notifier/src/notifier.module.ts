import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { NotifierController } from './notifier.controller';
import { NotifierService } from './notifier.service';
import { AppConfigModule, loggerModuleAsyncOptions } from '@app/common';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync(loggerModuleAsyncOptions),
    NotificationsModule,
  ],
  controllers: [NotifierController],
  providers: [NotifierService],
})
export class NotifierModule {}
