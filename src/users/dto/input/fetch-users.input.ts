import { ApiProperty } from '@nestjs/swagger';

export class FetchUsersInput {
  @ApiProperty({
    required: false,
    description:
      'The list of UserRecord objects for the current downloaded batch',
  })
  readonly maxResults: number;

  @ApiProperty({
    required: false,
    description:
      'The next page token. If not specified, returns users starting without any offset.',
  })
  readonly pageToken?: string;
}
