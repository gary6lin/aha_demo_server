import {
  Body,
  Controller,
  Get,
  HttpStatus,
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
    description: 'Invalid request body.',
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
}
