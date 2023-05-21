import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPasswordInput {
  @ApiProperty({
    required: true,
    description: 'The password that is currently in use',
  })
  readonly currentPassword: string;

  @ApiProperty({
    required: true,
    description: 'The new password to be updated',
  })
  readonly newPassword: string;
}
