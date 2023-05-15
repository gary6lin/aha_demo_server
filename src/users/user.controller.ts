import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
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
import { AuthService } from '../auth/services/auth.service';
import { PasswordFormatErrorDescription } from '../auth/errors/password-format.error';

@ApiBearerAuth()
@ApiTags('User')
@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
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
  @ApiOperation({
    summary: 'Register with email',
  })
  @ApiBody({
    required: true,
    description: 'The input data for creating a new user',
    type: CreateUserInput,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user has been created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: PasswordFormatErrorDescription,
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
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request body',
  })
  @Patch(':uid')
  async update(
    @Param('uid') uid: string,
    @Body() input: UpdateUserInput,
  ): Promise<void> {
    await this.usersService.update(
      uid,
      input.displayName,
      input.currentPassword,
      input.newPassword,
    );
  }
}
