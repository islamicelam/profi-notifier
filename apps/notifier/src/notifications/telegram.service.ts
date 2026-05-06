import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { firstValueFrom } from 'rxjs';

interface TelegramSendMessageResponse {
  ok: boolean;
  description?: string;
  parameters?: {
    retry_after?: number;
  };
}

@Injectable()
export class TelegramService {
  private readonly apiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    config: ConfigService,
    @InjectPinoLogger(TelegramService.name)
    private readonly logger: PinoLogger,
  ) {
    const token = config.getOrThrow<string>('TELEGRAM_BOT_TOKEN');
    this.apiUrl = `https://api.telegram.org/bot${token}`;
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    const url = `${this.apiUrl}/sendMessage`;

    try {
      await firstValueFrom(
        this.httpService.post<TelegramSendMessageResponse>(
          url,
          { chat_id: chatId, text, parse_mode: 'HTML' },
          { timeout: 10000 },
        ),
      );

      this.logger.info({ chatId }, 'Message sent to Telegram');
    } catch (error: unknown) {
      this.handleTelegramError(error, chatId);
    }
  }

  private handleTelegramError(error: unknown, chatId: string): never {
    if (!this.isAxiosError(error)) {
      throw error instanceof Error ? error : new Error(String(error));
    }

    const status = error.response?.status;
    const data = error.response?.data as
      | TelegramSendMessageResponse
      | undefined;
    const description = data?.description ?? 'Unknown error';

    this.logger.error({ chatId, status, description }, 'Telegram API error');

    if (status === 429) {
      const retryAfter = data?.parameters?.retry_after ?? 30;
      throw new Error(
        `Telegram rate limit exceeded. Retry after ${retryAfter}s`,
      );
    }

    if (status === 403) {
      throw new Error(
        `Bot blocked by user or chat not accessible: ${description}`,
      );
    }

    if (status === 400) {
      throw new Error(`Invalid request to Telegram: ${description}`);
    }

    throw new Error(
      `Telegram API error ${status ?? 'unknown'}: ${description}`,
    );
  }

  private isAxiosError(
    error: unknown,
  ): error is { response?: { status?: number; data?: unknown } } {
    return typeof error === 'object' && error !== null && 'response' in error;
  }
}
