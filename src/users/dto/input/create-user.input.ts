import { ApiProperty } from '@nestjs/swagger';
import { LoginUserInput } from './login-user.input';

export class CreateUserInput extends LoginUserInput {
  @ApiProperty({
    required: true,
    description: 'The display name of user',
  })
  readonly displayName: string;
}
