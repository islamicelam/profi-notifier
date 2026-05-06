import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiAcceptedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { SendNotificationDto } from '@app/contracts';
import { TelegramService } from './telegram.service';

@ApiTags('Notifications')
@Controller('notify')
export class NotificationsController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Send a notification via Telegram',
    description: 'Forwards the notification payload to the Telegram Bot API.',
  })
  @ApiAcceptedResponse({ description: 'Notification sent successfully' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async notify(@Body() dto: SendNotificationDto): Promise<void> {
    await this.telegramService.sendMessage(dto.chatId, dto.message);
  }
}
