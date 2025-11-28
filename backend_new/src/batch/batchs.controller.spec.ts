import { Test, TestingModule } from '@nestjs/testing';
import { FlocksController } from './batch.controller';

describe('FlocksController', () => {
  let controller: FlocksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlocksController],
    }).compile();

    controller = module.get<FlocksController>(FlocksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
