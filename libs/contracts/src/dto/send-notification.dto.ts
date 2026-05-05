import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  chatId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  message: string;
}
