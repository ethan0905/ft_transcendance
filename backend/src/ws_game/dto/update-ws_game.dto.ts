import { PartialType } from '@nestjs/mapped-types';
import { CreateWsGameDto } from './create-ws_game.dto';

export class UpdateWsGameDto extends PartialType(CreateWsGameDto) {
  id: number;
}
