import { ApiProperty } from '@nestjs/swagger';
import { UserRecord } from 'firebase-admin/lib/auth/user-record';

export class FetchUsersOutput {
  @ApiProperty({
    description:
      'The list of UserRecord objects for the current downloaded batch',
  })
  // @IsString()
  readonly users: UserRecord[];

  @ApiProperty({
    description:
      'The next page token. If not specified, returns users starting without any offset.',
  })
  readonly pageToken: string;
}
