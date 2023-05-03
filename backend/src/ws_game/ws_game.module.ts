import { Module } from '@nestjs/common';
import { WsGameService } from './ws_game.service';
import { WsGameGateway } from './ws_game.gateway';
import { WsGameController } from './ws_game.controller';

@Module({
  providers: [WsGameGateway, WsGameService],
  controllers: [WsGameController],
  exports:[WsGameService]
})
export class WsGameModule {}
