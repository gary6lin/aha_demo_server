import { ApiProperty } from '@nestjs/swagger';

export class FindUserProfileOutput {
  @ApiProperty({
    description: 'Full name of the person',
  })
  // @IsString()
  readonly displayName: string;

  @ApiProperty({
    description: 'The registered user email',
  })
  readonly email: string;
}
