import { ApiProperty } from '@nestjs/swagger';

export class FetchUsersOutput {
  @ApiProperty({
    description:
      'The page size, 1000 if undefined. This is also the maximum allowed limit.',
  })
  readonly users: UserRecord[];

  @ApiProperty({
    description:
      'The next page token. If not specified, returns users starting without any offset.',
  })
  readonly pageToken?: string;
}

export class UserRecord {
  readonly email?: string;
  readonly photoURL?: string;
  readonly displayName?: string;
  readonly metadata: any;
}
