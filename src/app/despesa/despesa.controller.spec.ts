import { Test, TestingModule } from '@nestjs/testing';
import { DespesaController } from './despesa.controller';

describe('DespesaController', () => {
  let controller: DespesaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DespesaController],
    }).compile();

    controller = module.get<DespesaController>(DespesaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
