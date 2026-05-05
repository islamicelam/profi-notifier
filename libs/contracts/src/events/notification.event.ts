import {
  IsEnum,
  IsISO8601,
  IsNotEmptyObject,
  IsObject,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';
import { NotificationChannel } from '../enums/notification-channel.enum';

export class TelegramPayload {
  @IsString()
  chatId: string;

  @IsString()
  message: string;
}

export class NotificationEvent {
  @IsUUID('4')
  eventId: string;

  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsObject()
  @IsNotEmptyObject()
  payload: TelegramPayload;

  @IsISO8601()
  occurredAt: string;

  @IsPositive()
  version: number;
}
