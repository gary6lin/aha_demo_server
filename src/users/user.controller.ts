import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserInput } from './dto/input/create-user.input';
import { UserService } from './services/user.service';
import { ProfileService } from './services/profile.service';
import { UpdateUserInput } from './dto/input/update-user.input';
import { Public } from '../auth/decorators/public.decorator';
import { AuthService } from '../auth/auth.service';

@ApiBearerAuth()
@ApiTags('User')
@ApiResponse({
  status: 401,
  description: 'Unauthorised users',
})
@Controller('user')
export class UserController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  @Public()
  @Get()
  async test(): Promise<string> {
    return 'Test Success';
  }

  @Public()
  @ApiOperation({
    summary: 'Register with email',
  })
  @ApiBody({
    required: true,
    description: 'The input data for creating a new user',
    type: CreateUserInput,
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  @Post()
  async create(@Body() input: CreateUserInput): Promise<void> {
    const user = await this.usersService.create(
      input.displayName,
      input.email,
      input.password,
    );
    await this.profileService.create(user.uid);
  }

  @ApiParam({
    name: 'uid',
    required: true,
    description: 'The users id from Firebase Auth',
    type: String,
  })
  @ApiBody({
    required: true,
    description: 'The input data for updating the user information',
    type: UpdateUserInput,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  @Patch(':uid')
  async update(
    @Param('uid') uid: string,
    @Body() input: UpdateUserInput,
  ): Promise<void> {
    if (input.displayName) {
      await this.usersService.updateDisplayName(uid, input.displayName);
    }
    if (input.currentPassword && input.newPassword) {
      await this.usersService.updatePassword(
        uid,
        input.currentPassword,
        input.newPassword,
      );
    }
  }
}
