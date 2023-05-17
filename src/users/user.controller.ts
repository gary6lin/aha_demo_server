import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
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
import { ProfileService } from './services/profile.service';
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
    private readonly profileService: ProfileService,
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
    const user = await this.usersService.createUser(
      input.displayName,
      input.email,
      input.password,
    );
    await this.profileService.create(user.uid);
  }

  @ApiOperation({
    summary: 'Updates an existing user.',
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
  async updateUser(
    @Param('uid') uid: string,
    @Body() input: UpdateUserInput,
  ): Promise<void> {
    await this.usersService.updateUser(
      uid,
      input.displayName,
      input.currentPassword,
      input.newPassword,
    );
  }

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
    description: 'OK',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body.',
  })
  @Get('users')
  async findUsers(
    @Query('maxResults') maxResults?: number,
    @Query('pageToken') pageToken?: string,
  ): Promise<FetchUsersOutput> {
    return await this.usersService.findUsers(maxResults, pageToken);
  }
}
