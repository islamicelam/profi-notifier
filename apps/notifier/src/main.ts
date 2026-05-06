import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ConfigService } from '@nestjs/config';
import { NotifierModule } from './notifier.module';
import { AllExceptionsFilter } from '@app/common';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(NotifierModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Notifier API')
    .setDescription('Sends notifications to Telegram via Bot API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  const config = app.get(ConfigService);
  const port = config.get<number>('NOTIFIER_PORT', 3002);

  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error('Failed to start application', err);
  process.exit(1);
});
