import { Test } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './services/user.service';
import { StatisticOutput } from './dto/output/statistic.output';
import { UserModule } from './user.module';
import { AppModule } from '../app.module';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserModule],
    }).compile();

    service = moduleRef.get<UserService>(UserService);
    controller = moduleRef.get<UserController>(UserController);
  });

  describe('findUsersStatistic', () => {
    it('should return user statistics', async () => {
      const result: StatisticOutput = {
        totalUsers: 16,
        activeUsers: 4,
        averageActiveUsers: 8,
      };
      jest
        .spyOn(service, 'countUsers')
        .mockImplementation(() => Promise.resolve(16));
      jest
        .spyOn(service, 'countActiveUsers')
        .mockImplementation(() => Promise.resolve(4));
      jest
        .spyOn(service, 'findAverageActiveUsers')
        .mockImplementation(() => Promise.resolve(8));

      expect(await controller.findUsersStatistic()).toStrictEqual(result);
    });
  });
});
