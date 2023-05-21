import { ApiProperty } from '@nestjs/swagger';
import { UserRecord } from '../user-record';

export class FindUsersOutput {
  @ApiProperty({
    description:
      'The page size, 1000 if undefined. This is also the maximum allowed limit.',
    type: UserRecord,
  })
  readonly users: UserRecord[];

  @ApiProperty({
    description:
      'The next page token. If not specified, returns users starting without any offset.',
  })
  readonly pageToken?: string;
}
