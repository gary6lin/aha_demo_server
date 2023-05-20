import { ApiProperty } from '@nestjs/swagger';
import { UserMetadataModel } from '../models/user.model';

export class UserMetadata implements UserMetadataModel {
  @ApiProperty()
  readonly creationTime: Date;

  @ApiProperty()
  readonly lastSignInTime: Date;

  @ApiProperty()
  readonly lastRefreshTime?: Date;
}
