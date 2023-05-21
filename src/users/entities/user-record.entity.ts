export class UserRecordEntity {
  readonly uid: string;
  readonly email?: string;
  readonly emailVerified: boolean;
  readonly displayName?: string;
  readonly photoURL?: string;
  readonly passwordHash?: string;
  readonly passwordSalt?: string;
  readonly tokensValidAfterTime?: string;
  readonly metadata: UserMetadataEntity;
}

export class UserMetadataEntity {
  readonly creationTime: string;
  readonly lastSignInTime: string;
  readonly lastRefreshTime?: string;
}
