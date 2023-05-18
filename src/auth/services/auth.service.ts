import { Injectable } from '@nestjs/common';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';

@Injectable()
export class AuthService {
  constructor(
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
  ) {}

  async verifyAccessToken(accessToken: string) {
    return await this.firebase.auth.verifyIdToken(accessToken);
  }
}
