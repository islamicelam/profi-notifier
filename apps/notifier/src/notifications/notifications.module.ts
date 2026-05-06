import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NotificationsController } from './notifications.controller';
import { TelegramService } from './telegram.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 3,
    }),
  ],
  controllers: [NotificationsController],
  providers: [TelegramService],
})
export class NotificationsModule {}
