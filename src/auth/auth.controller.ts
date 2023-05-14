import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginUserInput } from '../users/dto/input/login-user.input';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @ApiBody({
    required: true,
    description: 'The user input for login',
    type: LoginUserInput,
  })
  @ApiResponse({
    status: 200,
    description: 'The access token',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body',
  })
  @Post('auth')
  create(@Body() input: LoginUserInput) {
    // Returns an access token
    return this.authService.login(input.email, input.password);
  }

  @Get('profile')
  getProfile(@Request() req) {
    const user: DecodedIdToken = req.user;
    return user;
  }
}
