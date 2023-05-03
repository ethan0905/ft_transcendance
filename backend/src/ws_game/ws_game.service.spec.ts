import { Test, TestingModule } from '@nestjs/testing';
import { WsGameService } from './ws_game.service';

describe('WsGameService', () => {
  let service: WsGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WsGameService],
    }).compile();

    service = module.get<WsGameService>(WsGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
