import { Module } from '@nestjs/common';
import { FirebaseModule } from 'nestjs-firebase';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';

@Module({
  imports: [
    FirebaseModule.forRoot({
      googleApplicationCredential: './firebase-credential.json',
    }),
    // DatabaseModule,
    AuthModule,
    UserModule,
  ],
  // controllers: [UserController],
  // providers: [ProfileService],
})
export class AppModule {}
