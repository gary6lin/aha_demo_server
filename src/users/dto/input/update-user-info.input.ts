import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInfoInput {
  @ApiProperty({
    required: false,
    description: 'The display name of user',
  })
  readonly displayName: string;
}
