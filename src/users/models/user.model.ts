export class UserModel {
  readonly uid: string;
  readonly email?: string;
  readonly emailVerified: boolean;
  readonly displayName?: string;
  readonly photoURL?: string;
  readonly passwordHash?: string;
  readonly passwordSalt?: string;
  readonly tokensValidAfterTime?: Date;

  readonly creationTime: Date;
  readonly lastSignInTime?: Date;
  readonly lastRefreshTime?: Date;
}
