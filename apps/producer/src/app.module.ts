import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule, loggerModuleAsyncOptions } from '@app/common';
import { RmqModule } from '@app/rmq';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync(loggerModuleAsyncOptions),
    RmqModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
