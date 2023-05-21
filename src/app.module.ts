import { FirebaseModule } from 'nestjs-firebase';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.release',
    }),
    FirebaseModule.forRoot({
      googleApplicationCredential: './firebase-credential.json',
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
