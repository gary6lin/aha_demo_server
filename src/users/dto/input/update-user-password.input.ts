import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPasswordInput {
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
