import { ApiProperty } from '@nestjs/swagger';

export class LoginUserInput {
  @ApiProperty({
    required: true,
    description: 'The registered user email',
  })
  readonly email: string;

  @ApiProperty({
    required: true,
    description: 'The registered user password',
  })
  readonly password: string;
}
