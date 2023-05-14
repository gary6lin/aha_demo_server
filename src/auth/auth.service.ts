import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../users/services/user.service';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { PasswordService } from '../common/password.service';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private passwordService: PasswordService,
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
  ) {}

  async login(email: string, password: string) {
    let user: UserRecord;
    try {
      user = await this.firebase.auth.getUserByEmail(email);
    } catch (e) {
      throw new BadRequestException(e);
    }

    if (!user) {
      throw new BadRequestException();
    }

    const validated = await this.passwordService.validatePassword(
      password,
      user.passwordHash,
      user.passwordSalt,
    );

    if (!validated) {
      throw new BadRequestException();
    }

    return this.generateCustomToken(user.uid, user.email, user.emailVerified);
  }

  async generateCustomToken(
    uid: string,
    email: string,
    emailVerified: boolean,
  ) {
    return this.firebase.auth.createCustomToken(uid, {
      uid: uid,
      email: email,
      emailVerified: emailVerified,
    });
  }

  async verifyAccessToken(accessToken: string): Promise<DecodedIdToken> {
    return await this.firebase.auth.verifyIdToken(accessToken);
  }
}
