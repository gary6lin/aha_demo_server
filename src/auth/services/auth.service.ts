import { Injectable } from '@nestjs/common';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

@Injectable()
export class AuthService {
  constructor(
    @InjectFirebaseAdmin() private readonly firebase: FirebaseAdmin,
  ) {}

  async verifyAccessToken(accessToken: string): Promise<DecodedIdToken> {
    return await this.firebase.auth.verifyIdToken(accessToken);
  }
}
