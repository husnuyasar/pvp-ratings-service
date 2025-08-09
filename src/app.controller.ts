import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('healthz')
  getHello(): any {
    return {
      success: true,
      version: process.env.VERSION,
    };
  }
}
