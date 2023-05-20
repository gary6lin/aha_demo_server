import { Controller, Get, HttpStatus, Inject } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserService } from './users/services/user.service';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';

@ApiBearerAuth()
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorised users',
})
@Controller()
export class AppController {
  constructor(
    private readonly usersService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: CacheStore,
  ) {}

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

  @ApiTags('App')
  @Get('statistics')
  async statistics() {
    // TODO
    const totalUsers = await this.usersService.countUsers();
    // let activeUsers = 0;
    // let activeUsersd = 0;
    return;
  }
}
