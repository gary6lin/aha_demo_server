import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInput {
  @ApiProperty({ required: false })
  readonly email?: string;

  @ApiProperty({ required: true })
  readonly emailVerified: boolean;

  @ApiProperty({ required: false })
  readonly displayName?: string;

  @ApiProperty({ required: false })
  readonly photoURL?: string;

  @ApiProperty({ required: false })
  readonly passwordHash?: string;

  @ApiProperty({ required: false })
  readonly passwordSalt?: string;

  @ApiProperty({ required: false })
  readonly tokensValidAfterTime?: Date;

  @ApiProperty({ required: true })
  readonly creationTime: Date;

  @ApiProperty({ required: false })
  readonly lastSignInTime?: Date;

  @ApiProperty({ required: false })
  readonly lastRefreshTime?: Date;
}
