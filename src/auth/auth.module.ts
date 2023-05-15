import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { AuthService } from './services/auth.service';
import { PasswordService } from './services/password.service';

@Module({
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
    PasswordService,
  ],
  exports: [AuthService, PasswordService],
})
export class AuthModule {}
