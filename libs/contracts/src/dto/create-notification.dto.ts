import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { NotificationChannel } from '../enums/notification-channel.enum';

export class TelegramPayloadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  chatId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  message: string;
}

export class CreateNotificationDto {
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @IsObject()
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => TelegramPayloadDto)
  payload: TelegramPayloadDto;
}
