import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { SendNotificationDto } from '@app/contracts';

@Injectable()
export class NotifierClient {
  private readonly notifierUrl: string;

  constructor(
    private readonly httpService: HttpService,
    config: ConfigService,
    @InjectPinoLogger(NotifierClient.name)
    private readonly logger: PinoLogger,
  ) {
    this.notifierUrl = config.getOrThrow<string>('NOTIFIER_URL');
  }

  async send(dto: SendNotificationDto): Promise<void> {
    const url = `${this.notifierUrl}/notify`;

    this.logger.debug({ url, chatId: dto.chatId }, 'Sending notification');

    await firstValueFrom(
      this.httpService.post(url, dto, {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
}
