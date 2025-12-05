import { Test, TestingModule } from '@nestjs/testing';
import { ExtensionOfficerController } from './extension-officer.controller';

describe('ExtensionOfficerController', () => {
  let controller: ExtensionOfficerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtensionOfficerController],
    }).compile();

    controller = module.get<ExtensionOfficerController>(
      ExtensionOfficerController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
