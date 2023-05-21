import { ApiProperty } from '@nestjs/swagger';

export class UserRecord {
  @ApiProperty()
  readonly uid: string;

  @ApiProperty()
  readonly email?: string;

  @ApiProperty()
  readonly emailVerified: boolean;

  @ApiProperty()
  readonly displayName?: string;

  @ApiProperty()
  readonly photoURL?: string;

  @ApiProperty()
  readonly tokensValidAfterTime: Date;

  @ApiProperty()
  readonly creationTime: Date;

  @ApiProperty()
  readonly lastSignInTime: Date;

  @ApiProperty()
  readonly lastRefreshTime?: Date;
}
