import { Controller, Get, HttpStatus } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorised users',
})
@Controller()
export class AppController {
  @Public()
  @ApiTags('Health Check')
  @ApiOperation({
    summary:
      'Health check path used by the web service to monitor the app and for zero downtime deploys.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'I am alive!',
  })
  @Get('healthz')
  healthCheck(): void {
    return;
  }
}
