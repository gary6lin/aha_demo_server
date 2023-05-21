import { ApiProperty } from '@nestjs/swagger';

export class StatisticOutput {
  @ApiProperty()
  readonly totalUsers: number;

  @ApiProperty()
  readonly activeUsers: number;

  @ApiProperty()
  readonly averageActiveUsers: number;
}
