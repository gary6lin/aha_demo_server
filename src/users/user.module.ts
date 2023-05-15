import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserController } from './user.controller';
import { ProfileService } from './services/profile.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  providers: [UserService, ProfileService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
