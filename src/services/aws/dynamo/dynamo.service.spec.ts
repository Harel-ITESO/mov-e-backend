import { Test, TestingModule } from '@nestjs/testing';
import { DynamoService } from './dynamo.service';

describe('DynamoService', () => {
  let service: DynamoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DynamoService],
    }).compile();

    service = module.get<DynamoService>(DynamoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
