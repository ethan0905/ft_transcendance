import { Test, TestingModule } from '@nestjs/testing';
import { WsGameGateway } from './ws_game.gateway';
import { WsGameService } from './ws_game.service';

describe('WsGameGateway', () => {
  let gateway: WsGameGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WsGameGateway, WsGameService],
    }).compile();

    gateway = module.get<WsGameGateway>(WsGameGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
