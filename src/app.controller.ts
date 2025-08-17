import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Health')
export class AppController {
  @Get('healthz')
  @ApiOperation({
    summary: 'Health check'
  })
  getHello(): any {
    return {
      success: true,
      version: process.env.VERSION,
    };
  }
}
