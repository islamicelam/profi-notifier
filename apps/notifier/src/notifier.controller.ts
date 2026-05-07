import { Controller, Get } from '@nestjs/common';

@Controller()
export class NotifierController {
  @Get()
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
