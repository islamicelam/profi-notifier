import { Controller, Get } from '@nestjs/common';

@Controller()
export class ConsumerController {
  @Get()
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
