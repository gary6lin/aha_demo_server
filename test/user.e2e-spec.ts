import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserModule } from '../src/users/user.module';
import { UserService } from '../src/users/services/user.service';
import { AuthGuard } from '../src/auth/auth.guard';
import { MockAuthGuard } from '../src/auth/mock-auth.guard';

describe('Users', () => {
  const service = {
    countUsers: () => 456,
    countActiveUsers: () => 4,
    findAverageActiveUsers: () => 8,
  };

  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, UserModule],
    })
      .overrideProvider(AuthGuard)
      .useClass(MockAuthGuard)
      .overrideProvider(UserService)
      .useValue(service)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it(`/GET users-statistic`, () => {
    return request(app.getHttpServer())
      .get('/users-statistic')
      .expect(200)
      .expect({
        totalUsers: service.countUsers(),
        activeUsers: service.countActiveUsers(),
        averageActiveUsers: service.findAverageActiveUsers(),
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
