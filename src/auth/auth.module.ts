import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { UserService } from '../users/services/user.service';
import { PasswordService } from '../common/password.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    UserService,
    PasswordService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
