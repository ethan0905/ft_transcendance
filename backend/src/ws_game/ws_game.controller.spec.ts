import { Test, TestingModule } from '@nestjs/testing';
import { WsGameController } from './ws_game.controller';

describe('WsGameController', () => {
  let controller: WsGameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WsGameController],
    }).compile();

    controller = module.get<WsGameController>(WsGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
