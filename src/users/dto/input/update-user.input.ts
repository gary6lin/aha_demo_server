import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserInput {
  @ApiProperty({
    required: false,
    description: 'The display name of user',
  })
  readonly displayName: string;

  @ApiProperty({
    required: false,
    description: 'The password that is currently in use',
  })
  readonly currentPassword: string;

  @ApiProperty({
    required: false,
    description: 'The new password to be updated',
  })
  readonly newPassword: string;
}
