import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = moduleRef.get<AppController>(AppController);
  });

  describe('healthCheck', () => {
    it('should return an alive text', async () => {
      expect(controller.healthCheck()).toBe('I am alive!');
    });
  });
});
