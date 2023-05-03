import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket ,WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { WsGameService } from './ws_game.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(4343, {transports:['websocket'], namespace: 'ws-game', cors: false})

// export class WsGameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
export class WsGameGateway{
  @WebSocketServer() server: Server;
  // server: Server;
  constructor(private readonly wsGameService: WsGameService) {}
  
  //creer un tableau d'objet room {room_name, number_of_player or clients[], scores[], is_playing}

  afterInit() {
    // console.log("Inite");
  }

  handleConnection(client: Socket) {
    this.wsGameService.newUserConnected(client, this.server);
  }

  handleDisconnect(client: Socket) {
    this.wsGameService.userDisconnected(client, this.server);
  }

  @SubscribeMessage('matchmaking')
  handleMatchmaking(@ConnectedSocket() client: Socket): void {
    this.wsGameService.matchmaking(client, this.server);
  }

  @SubscribeMessage('cancelMatchmaking')
  handleCancelMatchmaking(@ConnectedSocket() client: Socket): void {
    this.wsGameService.cancelMatchmaking(client, this.server);
  }

  @SubscribeMessage('JoinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data:any) : void {
    this.wsGameService.joinRoom(client,data.room_name, this.server);
  }

  @SubscribeMessage('LeaveRoom')
  handleLeaveRoom(@ConnectedSocket() client:Socket,@MessageBody() data:any) : void {
    this.wsGameService.leaveRoom(client, data.room_name, this.server);
  }

  @SubscribeMessage('MakeMove')
  handleMakeMove(@ConnectedSocket() client: Socket, @MessageBody() data: any): void {
    this.wsGameService.MakeMove(client, this.server,data);
  }

}
