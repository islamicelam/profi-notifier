import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModuleAsyncParams } from 'nestjs-pino';
import type { IncomingMessage, ServerResponse } from 'http';

type PinoRequest = IncomingMessage & { id?: string | number };

export const loggerModuleAsyncOptions: LoggerModuleAsyncParams = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const isProduction = config.get<string>('NODE_ENV') === 'production';

    return {
      pinoHttp: {
        level: isProduction ? 'info' : 'debug',
        transport: isProduction
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                singleLine: true,
                colorize: true,
                translateTime: 'SYS:HH:MM:ss',
              },
            },
        redact: ['req.headers.authorization', 'req.headers.cookie'],
        serializers: {
          req(req: PinoRequest) {
            return {
              id: req.id,
              method: req.method,
              url: req.url,
            };
          },
          res(res: ServerResponse) {
            return {
              statusCode: res.statusCode,
            };
          },
        },
      },
    };
  },
};
