import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiAcceptedResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateNotificationDto } from '@app/contracts';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Submit a notification request',
    description:
      'Validates the payload, generates an event ID, and enqueues the notification for asynchronous delivery.',
  })
  @ApiAcceptedResponse({
    description: 'Notification accepted for processing',
    schema: {
      type: 'object',
      properties: {
        eventId: { type: 'string', format: 'uuid' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
  })
  async create(
    @Body() dto: CreateNotificationDto,
  ): Promise<{ eventId: string }> {
    return this.notificationsService.publish(dto);
  }
}
