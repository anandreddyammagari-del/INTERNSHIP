import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'b2b-order-management-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
