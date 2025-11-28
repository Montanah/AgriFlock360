import { Test, TestingModule } from '@nestjs/testing';
import { VaccineCatalogController } from './vaccine-catalog.controller';

describe('VaccineCatalogController', () => {
  let controller: VaccineCatalogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VaccineCatalogController],
    }).compile();

    controller = module.get<VaccineCatalogController>(VaccineCatalogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
