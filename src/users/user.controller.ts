import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserInput } from './dto/input/create-user.input';
import { UserService } from './services/user.service';
import { UpdateUserInput } from './dto/input/update-user.input';
import { Public } from '../auth/decorators/public.decorator';
import { AuthService } from '../auth/services/auth.service';
import { PasswordFormatErrorDescription } from '../auth/errors/password-format.error';
import { FetchUsersOutput } from './dto/output/fetch-users.output';
import { StatisticOutput } from './dto/output/statistic.output';
import {
  ACTIVE_USERS_KEY,
  AVERAGE_ACTIVE_USERS_KEY,
  DEFAULT_NUMBER_OF_DAYS,
  STATISTICS_TTL,
  TOTAL_USERS_KEY,
} from './constants';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';

@ApiBearerAuth()
@ApiTags('User')
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorised users',
})
@Controller()
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: CacheStore,
  ) {}

  @Public()
  @ApiOperation({
    summary: 'Creates a new user with email and password.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been created successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: PasswordFormatErrorDescription,
  })
  @Post('user')
  async createUser(@Body() input: CreateUserInput): Promise<void> {
    await this.usersService.createUser(
      input.displayName,
      input.email,
      input.password,
    );
  }

  @ApiOperation({
    summary: 'Updates the information of an existing user.',
  })
  @ApiParam({
    name: 'uid',
    description: 'The users id from Firebase Auth.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body.',
  })
  @Patch('user/:uid/info')
  async updateUserInfo(
    @Param('uid') uid: string,
    @Body() input: UpdateUserInput,
  ): Promise<void> {
    await this.usersService.updateUserInfo(uid, input.displayName);
  }

  @ApiOperation({
    summary: 'Updates the password of an existing user.',
  })
  @ApiParam({
    name: 'uid',
    description: 'The users id from Firebase Auth.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been updated successfully.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body.',
  })
  @Patch('user/:uid/password')
  async updateUser(
    @Param('uid') uid: string,
    @Body() input: UpdateUserInput,
  ): Promise<void> {
    await this.usersService.updateUserPassword(
      uid,
      input.currentPassword,
      input.newPassword,
    );
  }

  @Public()
  @ApiOperation({
    summary:
      'Retrieves all the users in batches with a size of maxResults starting from the offset as specified by pageToken.',
  })
  @ApiQuery({
    name: 'maxResults',
    required: false,
    description:
      'The page size, 1000 if undefined. This is also the maximum allowed limit.',
  })
  @ApiQuery({
    name: 'pageToken',
    required: false,
    description:
      'The next page token. If not specified, returns users starting without any offset.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FetchUsersOutput,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query value.',
  })
  @Get('users')
  async findUsers(
    @Query('maxResults', ParseIntPipe) maxResults?: number,
    @Query('pageToken') pageToken?: string,
  ): Promise<FetchUsersOutput> {
    const users = await this.usersService.findUsers(maxResults, pageToken);
    return {
      users: users,
      pageToken: users.length > 0 ? users[users.length - 1].uid : null,
    } as FetchUsersOutput;
  }

  @ApiOperation({
    summary:
      'The statistic for the users, such as the total users and the daily active users.',
  })
  @ApiQuery({
    name: 'numberOfDays',
    required: false,
    description: `The number of days for calculating the average active users. Defaults to ${DEFAULT_NUMBER_OF_DAYS} days.`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: StatisticOutput,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query value.',
  })
  @Get('users-statistic')
  async statistic(
    @Query('numberOfDays', ParseIntPipe) numberOfDays = DEFAULT_NUMBER_OF_DAYS,
  ) {
    // Read the total users from cache first
    let totalUsers = await this.cacheManager.get<number>(TOTAL_USERS_KEY);
    console.log(`totalUsers: ${totalUsers}`);
    if (!totalUsers) {
      // or get the value again from the database if the ttl expires
      totalUsers = await this.usersService.countUsers();
      // Set the result to cache for the next use
      await this.cacheManager.set<number>(
        TOTAL_USERS_KEY,
        totalUsers,
        STATISTICS_TTL,
      );
    }

    // Read the daily active users from cache first
    let activeUsers = await this.cacheManager.get<number>(ACTIVE_USERS_KEY);
    console.log(`activeUsers: ${activeUsers}`);
    if (!activeUsers) {
      // or get the value again from the database if the ttl expires
      activeUsers = await this.usersService.countActiveUsers();
      // Set the result to cache for the next use
      await this.cacheManager.set<number>(
        ACTIVE_USERS_KEY,
        activeUsers,
        STATISTICS_TTL,
      );
    }

    // Read the average active users from cache first
    let average = await this.cacheManager.get<number>(AVERAGE_ACTIVE_USERS_KEY);
    console.log(`average: ${average}`);
    if (!average) {
      // or get the value again from the database if the ttl expires
      average = await this.usersService.findAverageActiveUsers(numberOfDays);
      // Set the result to cache for the next use
      await this.cacheManager.set<number>(
        AVERAGE_ACTIVE_USERS_KEY,
        average,
        STATISTICS_TTL,
      );
    }

    return {
      totalUsers: totalUsers,
      activeUsers: activeUsers,
      averageActiveUsers: average,
    } as StatisticOutput;
  }
}
