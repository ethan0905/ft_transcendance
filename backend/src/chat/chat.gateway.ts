import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { ChannelCreateDto } from './dto/create-chat.dto';
import { ChannelMessageSendDto, DmMsgSend  } from './dto/msg.dto';
import { ValidationPipe, UsePipes } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { PrismaClient } from '@prisma/client';
import { QuitChanDto, JoinChanDto, ActionsChanDto, PlayChanDto} from "./dto/edit-chat.dto"
import { EditChannelCreateDto } from './dto/edit-chat.dto';
import { IsAdminDto } from './dto/admin.dto';

export interface User {
  id: number;
  username: string;
  email: string;
}
@UsePipes(new ValidationPipe())
 @WebSocketGateway({
     cors: {
     origin: `${process.env.SOCKET_URL}`,
   },
   namespace: 'chat',
  })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;
  clients: {[key:string]:User} = {};

  constructor(
    private readonly chatService: ChatService,
    private readonly prisma: PrismaClient,
    private readonly userService: UserService,
  ) {
    this.server = new Server();
  }



  async handleConnection(client: Socket) : Promise<any> {
    try
    {
      const user = await this.prisma.user.findUnique({
        where : {
          accessToken : client.handshake.auth.token,
        },
        select:{
          id: true,
          username: true,
          email: true,
        }
      })
      this.clients[client.id] = user;
      // console.log("Connect")
      // console.log(this.clients);
    }
    catch (e){
      console.log(e);
      client.disconnect();
      return;
    }
  }


  handleDisconnect(client: Socket) {
    // console.log("Disconnect")
    delete this.clients[client.id];
  }

  @SubscribeMessage('create channel')
  async chat(
    @MessageBody() data: ChannelCreateDto,
    @ConnectedSocket() client: Socket,
  ) {
      const chat = await this.chatService.newChannel(data, this.clients[client.id].username);
      if (!chat.isPrivate)
        this.server.emit("Channel Created", {channelName:data.chatName, id: chat.id, client_id: client.id});
      else
        this.server.to(client.id).emit("Channel Created", {channelName:data.chatName, id: chat.id, client_id: client.id});
    }

  @SubscribeMessage('sendMsgtoC')
  async MsgtoC(
    @MessageBody()  data: ChannelMessageSendDto,
    @ConnectedSocket() client : Socket,
  ) {
    const chat = await this.chatService.newMsg(data, this.clients[client.id].id);
    const except_user = await this.chatService.getExceptUser(data.chatId, this.clients[client.id].id);
    let except = await this.server.in(data.chatId.toString()).fetchSockets().then((sockets) => {
      let except_user_socket = [];
      sockets.forEach((socket) => {
        if (except_user.some((user) => user.username === this.clients[socket.id].username))
          except_user_socket.push(socket.id);
      });
      return except_user_socket;
    });
    if (chat == null)
      return "error";
    this.server.to(data.chatId.toString()).except(except).emit("NewMessage",chat); // emit to the room
  }

  @SubscribeMessage('joinNewChannel')
  async join_chan(
    @MessageBody()  data: JoinChanDto ,
    @ConnectedSocket() client : Socket,
  ) {
    if (this.clients[client.id] === undefined)
    {
      this.server.to(client.id).emit("error", "Error refresh the page!!!");
      return;
    }
    const user = await this.userService.getUser(this.clients[client.id].username);
    const ret = await this.chatService.join_Chan(data, user);
    if (ret === 0 || ret === 5){
      client.join(data.chatId.toString());
      if (ret !== 5)
        client.to(data.chatId.toString()).emit("NewUserJoin", {username: user.username, id: user.id, status: user.status, avatarUrl: user.avatarUrl})
      this.server.to(client.id).emit("Joined", {chatId: data.chatId});
    }
    else if (ret  == 1)
    this.server.to(client.id).emit("error", "NotInvited");
    else if (ret == 2)
    this.server.to(client.id).emit("error", "Banned");
    else if (ret == 3){
      this.server.to(client.id).emit("error", "Wrong password");
    }
    else{
      this.server.to(client.id).emit("error", "This channel does not exist!!!");
    }
  }

  @SubscribeMessage('JoinChannel')
  async join(
    @MessageBody()  data: number ,
    @ConnectedSocket() client : Socket,
  ) {
    if(this.clients[client.id] === undefined)
      return;
    const user = await this.userService.getUser(this.clients[client.id].username);
    const userIsInChan = await this.chatService.userIsInChan(user.accessToken, data);
    if (userIsInChan)
      client.join(data.toString());
    else {
      this.server.to(client.id).emit("error", "You are not in this channel");
    }
  }

  @SubscribeMessage('quit')
  async quit_chan(
    @MessageBody()  data: QuitChanDto ,
    @ConnectedSocket() client : Socket,
    ) {
      if (this.clients[client.id] === undefined)
      return;
      const chatInfo = await this.chatService.isDM(data.chatId);
      if (chatInfo){
        this.server.to(client.id).emit("DM:quit");
        return;
      }
    const quit = await this.chatService.quit_Chan(this.clients[client.id].username, data.chatId);
    client.leave(data.chatId.toString());
    this.server.to(client.id).emit("quited", {chatId:data.chatId});
    this.server.to(data.chatId.toString()).emit("quit",{username:this.clients[client.id].username})
    // console.log("user quit: " + this.clients[client.id].username);
  }

  @SubscribeMessage('is-admin')
  async isAdmin_Chan(
    @MessageBody()  data: IsAdminDto ,
    @ConnectedSocket() client : Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].username, data.channel_id);
    // console.log("is admin: " + isAdmin);
    if (isAdmin)
      this.server.to(client.id).emit("isAdmin", {isAdmin:isAdmin});
    else
      this.server.to(client.id).emit("isAdmin", {isAdmin:isAdmin});
  }

  @SubscribeMessage('invit')
  async inv_chan(
    @MessageBody()  data: ActionsChanDto ,
    @ConnectedSocket() client : Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].username, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.invit_Chan(data.username, data.chatId);
    for (let key in this.clients){
      if (this.clients[key].username === data.username)
      {
        let channel = await this.chatService.get__chanNamebyId(data.chatId); 
        this.server.to(key).emit("invited", {chatId:data.chatId, channelName:channel.channelName})
        return;
      }
    }
    // console.log("user invited");
  }

  @SubscribeMessage('ban')
  async ban_chan(
    @MessageBody()  data: ActionsChanDto ,
    @ConnectedSocket() client : Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].username, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.ban_Chan(data.username, data.chatId);
    for (let key in this.clients){
      if (this.clients[key].username === data.username){
        this.server.fetchSockets().then(
          (sockets) => {
            sockets.find((socket) => socket.id === key).leave(data.chatId.toString());
          }
        );
        this.server.to(key).emit("banned", {chatId: data.chatId});
        break;
      }
    }
    this.server.to(data.chatId.toString()).emit("ban", {username: data.username});
    // console.log("chan banned");
  }

  @SubscribeMessage('unban')
  async unban_chan(
    @MessageBody()  data: ActionsChanDto ,
    @ConnectedSocket() client : Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    // console.log(data);
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].username, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.unban_Chan(data.username, data.chatId);
    for (let key in this.clients){
      if (this.clients[key].username === data.username){
        this.server.to(key).emit("unbanned", {chatId: data.chatId});
        break;
      }
    }
    this.server.to(data.chatId.toString()).emit("unban", {username: data.username});
    // console.log("chan unbanned");
  }

  @SubscribeMessage('kick')
  async kick_chan(
    @MessageBody()  data: ActionsChanDto ,
    @ConnectedSocket() client : Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].username, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.kick_Chan(data.username, data.chatId);
    for (let key in this.clients){
      if (this.clients[key].username === data.username){
        if (this.clients[key].username === data.username){
          this.server.fetchSockets().then(
            (sockets) => {
              sockets.find((socket) => socket.id === key).leave(data.chatId.toString());
            }
          );
        }
        this.server.to(key).emit("kicked", {chatId: data.chatId});
        break;
      }
    }
    this.server.to(data.chatId.toString()).emit("kick", {username: data.username});
    // console.log("chan kicked");
  }

  
  @SubscribeMessage('mute')
  async mute_chan(
    @MessageBody()  data: ActionsChanDto ,
    @ConnectedSocket() client : Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].username, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.mute_Chan(data.username, data.chatId);
    this.server.to(data.chatId.toString()).emit("mute", {username: data.username});
    // console.log("chan muteed");
  }

    
  @SubscribeMessage('unmute')
  async unmute_chan(
    @MessageBody()  data: ActionsChanDto ,
    @ConnectedSocket() client : Socket,
  ) {
    if (this.clients[client.id] === undefined)
      return;
    const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].username, data.chatId);
    if (!isAdmin)
      return;
    await this.chatService.unmute_Chan(data.username, data.chatId);
    this.server.to(data.chatId.toString()).emit("unmute", {username: data.username});
    // console.log("chan unmuteed");
  }

  @SubscribeMessage('CreateDm')
  async createDm(@ConnectedSocket() client:Socket, @MessageBody() data:any){
    const dmchannel = await this.chatService.createDmChannel(this.clients[client.id].username, data.username)
    for (let key in this.clients){
      if (this.clients[key].username === data.username){
        this.server.to(key).emit("DM Created",{channelName:this.clients[client.id].username, id: dmchannel.id})
      }
    }
    this.server.to(client.id).emit("DM Created",{channelName:data.username, id: dmchannel.id})
    return ;
  }

  @SubscribeMessage('set-admin')
  async set_admin(
    @MessageBody()  data: ActionsChanDto ,
    @ConnectedSocket() client : Socket,)
    {
        if (this.clients[client.id] === undefined)
          return;
        const isAdmin = await this.chatService.isAdmin_Chan(this.clients[client.id].username, data.chatId);
        if (!isAdmin)
          return;
        await this.chatService.set_admin_Chan(data.username, data.chatId);
        this.server.to(data.chatId.toString()).emit("set-admin", {username: data.username});
        // console.log("new admin");
  }

  @SubscribeMessage('update')
  async update_chan(
    @MessageBody()  data: EditChannelCreateDto ,
    @ConnectedSocket() client : Socket,
  ) {
    
    const res : number = await this.chatService.update_chan(data);
    if (res == 1)
      client.broadcast.emit('Password is empty but chan need password', data);
    else if (res == 2)
      client.broadcast.emit('not an admin', data);
    else
      client.broadcast.emit('chan updated', data);
  }

  @SubscribeMessage('play')
  async playMatchWithFriends(@ConnectedSocket() client:Socket, @MessageBody()  data: PlayChanDto){
    const room = await this.chatService.playMatchWithFriends(client, this.clients[client.id].username, data.chatId, this.server);
    setTimeout(async () => {
      this.server.to(client.id).emit("NewPartyCreated", room.name);
      const msg = await this.chatService.newMsg({chatId:data.chatId,msg:"Link to Play with me:\n"+`${process.env.FRONTEND_URL}`+"/Game/"+room.name}, this.clients[client.id].id);
      this.server.to(data.chatId.toString()).emit("NewMessage", msg);
    },2000);

  }
}