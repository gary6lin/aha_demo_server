import { ApiProperty } from '@nestjs/swagger';
import { UserMetadata } from './user-metadata';
import { UserModel } from '../models/user.model';

export class UserRecord implements UserModel {
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
  readonly passwordHash: string;

  @ApiProperty()
  readonly passwordSalt: string;

  @ApiProperty()
  readonly tokensValidAfterTime: Date;

  @ApiProperty()
  readonly metadata: UserMetadata;
}
