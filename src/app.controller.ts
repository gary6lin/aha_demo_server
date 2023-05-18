import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
export class AppController {
  @Public()
  @ApiOperation({
    summary:
      'Health check path used by the web service to monitor the app and for zero downtime deploys.',
  })
  @Get('healthz')
  healthCheck(): void {
    return;
  }
}
