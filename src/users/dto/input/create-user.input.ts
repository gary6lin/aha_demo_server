import { ApiProperty } from '@nestjs/swagger';

export class CreateUserInput {
  @ApiProperty({
    required: true,
    description: 'The display name of user',
  })
  readonly displayName: string;

  @ApiProperty({
    required: true,
    description: 'The email address is also your login account',
  })
  readonly email: string;

  @ApiProperty({
    required: true,
    description: 'The password for login',
  })
  readonly password: string;
}
