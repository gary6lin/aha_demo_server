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
import { Public } from '../auth/decorators/public.decorator';
import { AuthService } from '../auth/services/auth.service';
import { PasswordFormatErrorDescription } from '../auth/errors/password-format.error';
import { FindUsersOutput } from './dto/output/find-users.output';
import { StatisticOutput } from './dto/output/statistic.output';
import {
  ACTIVE_USERS_KEY,
  AVERAGE_ACTIVE_USERS_KEY,
  DEFAULT_NUMBER_OF_DAYS,
  MAX_PAGE_SIZE,
  STATISTICS_TTL,
  TOTAL_USERS_KEY,
} from './constants';
import { CACHE_MANAGER, CacheStore } from '@nestjs/cache-manager';
import { UpdateUserInfoInput } from './dto/input/update-user-info.input';
import { UpdateUserPasswordInput } from './dto/input/update-user-password.input';

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
    summary: 'Pull the user from Firebase Auth and updates in our database.',
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
  @Patch('user/:uid')
  async updateUser(@Param('uid') uid: string): Promise<void> {
    await this.usersService.pullUserAndUpdate(uid);
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
    @Body() input: UpdateUserInfoInput,
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
  async updateUserPassword(
    @Param('uid') uid: string,
    @Body() input: UpdateUserPasswordInput,
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
      'Retrieves all the users in batches with a size of pageSize starting from the offset as specified by pageToken.',
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    description: `Defaults to ${MAX_PAGE_SIZE} if undefined. This is also the maximum allowed limit.`,
  })
  @ApiQuery({
    name: 'pageToken',
    required: false,
    description:
      'The next page token. If not specified, returns users starting without any offset.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: FindUsersOutput,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid query value.',
  })
  @Get('users')
  async findUsers(
    @Query('pageSize', ParseIntPipe) pageSize?: number,
    @Query('pageToken') pageToken?: string,
  ): Promise<FindUsersOutput> {
    const users = await this.usersService.findUsers(pageSize, pageToken);
    return {
      users: users,
      pageToken: users.length > 0 ? users[users.length - 1].uid : null, // Uid is used as pageToken
    } as FindUsersOutput;
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
  async findUsersStatistic(
    @Query('numberOfDays', ParseIntPipe) numberOfDays = DEFAULT_NUMBER_OF_DAYS,
  ) {
    // Read the total users from cache first
    let totalUsers = await this.cacheManager.get<number>(TOTAL_USERS_KEY);
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
