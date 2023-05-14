import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';
import { ProfileService } from './services/profile.service';
import { PasswordService } from '../common/password.service';
import { DatabaseModule } from '../database/database.module';
import { AuthService } from '../auth/auth.service';

@Module({
  imports: [DatabaseModule],
  providers: [AuthService, PasswordService, UserService, ProfileService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
