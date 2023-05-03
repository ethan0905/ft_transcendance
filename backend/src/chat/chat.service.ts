import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelCreateDto } from './dto/create-chat.dto';
import { ChannelMessageSendDto, DmMsgSend  } from './dto/msg.dto';
import { updateChat } from './type/chat.type';
import { UserService } from 'src/user/user.service'
import { Message, User } from '@prisma/client';
import { AuthService } from 'src/auth/auth.service';
import { JoinChanDto, EditChannelCreateDto } from 'src/chat/dto/edit-chat.dto';
import { channel } from 'diagnostics_channel';
import { use } from 'passport';
import * as bcrypt from 'bcrypt';
import { Server, Socket } from 'socket.io';
import { WsGameService } from 'src/ws_game/ws_game.service';


@Injectable()
export class ChatService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly auth: AuthService,
        private readonly WsGameService: WsGameService,
        ) {}

        async newChannel(info: ChannelCreateDto, username: string) {

          let hash = null;
          info.isPassword = false;
            if (info.Password != null && info.Password != undefined && info.Password != "")
            {
              const salt = await bcrypt.genSalt();

              hash = await bcrypt.hash(info.Password, salt);
              // console.log("hash:" + hash);
              info.isPassword = true;
            }

            if (info.isPrivate === undefined)
              info.isPrivate = false;
            // if (info.Password != null && info.Password != undefined && info.Password != "")
            //   info.isPassword = true;
            // console.log(info);
            const user = await this.userService.getUser(username);
            const channel = await this.prisma.channel.create({
              data: {
                channelName: info.chatName,
                password: hash,
                isPrivate: info.isPrivate,
                isPassword: info.isPassword,
                owner: {
                  connect: {
                    username : username,
                  }
                },
                admins: {
                  connect: {
                    username : username,
                  }
                },
                members: {
                  connect: {
                    username : username,
                  }
                }
              }
            });
            return channel;
          }

        async delChanById(id : number)
        {
          const chan = await this.prisma.channel.delete(
            {
              where: {
                id : id,
              },
            }
          )
        }

        async quit_Chan(username: string, id : number)
        {
          const value = await this.prisma.channel.update(
            {
              where: {
                id: id,
              },
              data : {
                members : {
                  disconnect : {
                    username : username,
                  },
                },
              },
                //isPrivate : info.Private,
              }
          )
          // console.log(value);
        }

        async invit_Chan(username: string, id : number)
        {
          await this.prisma.channel.update(
            {
              where: {
                id: id,
              },
              data : {
                invited : {
                  connect : {
                    username : username,
                  },
                },
              },
                //isPrivate : info.Private,
              }
          )
        }

        async ban_Chan(username: string, id : number)
        {
          await this.prisma.channel.update(
            {
              where: {
                id: id,
              },
              data : {
                admins:{
                  disconnect : {
                    username : username,
                  },
                },
                members : {
                  disconnect : {
                    username : username,
                  },
                },
                muted:{
                  disconnect : {
                    username : username,
                  },
                },
                banned : {
                  connect : {
                    username : username,
                  },
                },
              },
                //isPrivate : info.Private,
              }
          )
        }

        async unban_Chan(username: string, id : number)
        {
          await this.prisma.channel.update(
            {
              where: {
                id: id,
              },
              data : {
                banned : {
                  disconnect : {
                    username : username,
                  },
                },
                members : {
                  connect : {
                    username : username,
                  },
                },
              },
                //isPrivate : info.Private,
              }
          )
        }

        async kick_Chan(username: string, id : number)
        {
          await this.prisma.channel.update(
            {
              where: {
                id: id,
              },
              data : {
                admins:{
                  disconnect : {
                    username : username,
                  },
                },
                members : {
                  disconnect : {
                    username : username,
                  },
                },
                muted:{
                  disconnect : {
                    username : username,
                  },
                },
              },
                //isPrivate : info.Private,
              }
          )
        }

        
        async mute_Chan(username: string, id : number)
        {
          await this.prisma.channel.update(
            {
              where: {
                id: id,
              },
              data : {
                muted : {
                  connect : {
                    username : username,
                  },
                },
              },
                //isPrivate : info.Private,
              }
          )
        }

        async set_admin_Chan(username: string, id : number)
        {
          await this.prisma.channel.update(
            {
              where: {
                id: id,
              },
              data : {
                admins : {
                  connect : {
                    username : username,
                  },
                },
              },
              }
          )
        }

        
        
        async unmute_Chan(username: string, id : number)
        {
          await this.prisma.channel.update(
            {
              where: {
                id: id,
              },
              data : {
                muted : {
                  disconnect : {
                    username : username,
                  },
                },
              },
                //isPrivate : info.Private,
              }
          )
        }

        async join_Chan(data: JoinChanDto, user: User)
        {
          const isInChan = await this.userIsInChan(user.accessToken, data.chatId);
          if (isInChan)
            return (5);
          const chan = await this.prisma.channel.findUnique({
            where : {
              id : data.chatId,
            },
            select : {
              isPrivate : true,
              isPassword : true,
              banned : true,
              password : true,
              invited : true,
            }
          })
          if (chan === null)
            return (4);
          const isban = chan.banned.find(banned => banned.username == user.username)
          const isinvit = chan.invited.find(invited => invited.username == user.username)
          const isPriv = chan.isPrivate;
          if (isPriv || isban)
          {
            if (isPriv && !isinvit)
            return (1);
            else if (isban)
            return (2);
          }
          else if (chan.password !== '' && chan.password !== null && chan.password !== undefined){
            // console.log("chan pass : ", chan.password, "data pass : ", data.Password);
            const isMatch = await bcrypt.compare(data.Password, chan.password);

            // console.log("is mathc ? " + isMatch);

            if (!isMatch)
              return (3);
          }
          await this.prisma.channel.update(
            {
              where: {
                id: data.chatId,
              },
              data : {
                members : {
                  connect : {
                    username : user.username,
                  },
                },
              },
                //isPrivate : info.Private,
              }
          )
          if (isinvit)
            await this.prisma.channel.update(
              {
                where: {
                  id: data.chatId,
                },
                data : {
                  invited : {
                    disconnect : {
                      username : user.username,
                    },
                  },
                },
                  //isPrivate : info.Private,
                }
            )
          return (0);
        }

        async isBan_Chan(username: string, id : number)
        {
          const chan = await this.prisma.channel.findFirst({
            where: {
                      id: id,
              
          },
            select : {
              banned : true,
            }
          })
          const isban : User = chan.banned.find(banned => banned.username == username)
          if (isban)
            return (true)
          else
            return (false)
        }

        async isAdmin_Chan(username: string, id : number)
        {
          const chan = await this.prisma.channel.findFirst({
            where: {
                      id: id,
              
          },
            select : {
              admins : true,
            }
          })
          const isad : User = chan.admins.find(admins => admins.username == username)
          if (isad)
            return (true)
          else
            return (false)
        }

        async newMsg(info : ChannelMessageSendDto, id : number)
        {
          const channelid = info.chatId;
          const user = await this.prisma.user.findUnique({
            where: {
              id: id,
            },
          });
          const isInChan = await this.userIsInChan(user.accessToken, channelid);
          const isMuted = await this.userIsChanMuted(user.accessToken, channelid);
          if (!isInChan || isMuted){
            return (null);
          }
          const message: Message = await this.prisma.message.create({
            data: {
              owner :{
                connect: {
                  id : user.id,
                }
              },
              channel : {
                connect: {
                  id : info.chatId,
                }
              },
              message : info.msg,
            },
            select: {
              id: true,
              owner:{
                select: {
                  avatarUrl: true,
                  username:true,
                }
              },
              createdAt: true,
              message: true,
              userId: true,
              channelId: true,
            },
          });

          return (message);
        }

        async newDM(info : DmMsgSend, id : number)
        {
          const channelid = parseInt(info.target);
          const user = this.prisma.user.findUnique({
            where: {
             id: id,
            },
          });
          const userid = (await user).id;
          const channel = this.prisma.channel.findUnique({
            where: {
             id: channelid,
            },
          });
          const message: Message = await this.prisma.message.create({
            data: {
              owner :{
                connect: {
                  id : userid,
                }
              },
              channel : {
                connect: {
                  id : channelid,
                }
              },
              message : info.msg,
            },
            select: {
              id: true,
              createdAt: true,
              message: true,
              userId: true,
              channelId: true,
            },
          });

          return (message);
        }

        async get__channelsUserCanJoin(token:string) {
          try {
            const source = await this.prisma.channel.findMany({
              where: {
                OR: [
                {
                    isPrivate: false
                },
                {invited : { some : { accessToken : token}}},
              ],
              AND : {
                members : { none : { accessToken : token}},
                banned : { none : { accessToken : token}},
              }
              },
              select: {
                id : true,
                channelName: true,
              },
            });
            return source;
          } catch (error) {
            console.log('get__channels error:', error);
          }
        }

        async get__channelsUserIn(token:string) {
          try {
            const source = await this.prisma.channel.findMany({
              where: {
                members : { some : {accessToken : token}},
                isDM:false,
              },
              select: {
                id : true,
                channelName: true,
              },
            });
            return source;
          } catch (error) {
            console.log('get__channels error:', error);
          }
        }

        async get__DmUser(token:string) {
          try {
            const source = await this.prisma.channel.findMany({
              where: {
                members : { some : {accessToken : token}},
                isDM:true,
              },
              select: {
                id : true,
                members:{
                  where:{
                    NOT:{accessToken:token},
                  },
                  select:{
                    username:true,
                  }
                }
              },
            });
            return source;
          } catch (error) {
            console.log('get__channels error:', error);
          }
        }

        async get__allUserInchan(id : number) {
          try {
            const source = await this.prisma.channel.findUnique({
              where: {
                id : id,
                },
              select: {
                members : true,
              },
            });
            return source.members;
          } catch (error) {
            console.log('get__user error:', error);
          }
        }

        organize__channelToJoin(source: any) {
          const channels = [];
          // console.log("source : ", source)
          // console.log("channelName : ", source.channelName)
          // console.log("source size : ", source.contains)
          // console.log("member : ", source.member)

          return channels;
        }

        async get__UserIn(id : number) {
          try {
            const source = await this.prisma.channel.findMany({
              where: {
                id : id,
              },
              select: {
                isDM:true,
                admins: {
                  select: {username: true,status: true,avatarUrl: true,id: true},
                },
                members: {
                  where: {
                    AND: {
                      admins: {none: {id: id}},
                      muted: {none: {id: id}},
                    },
                  },
                  select:{username:true,status:true,avatarUrl:true,id:true},
                },
                muted: {
                  select: {username: true,status: true,avatarUrl: true,id: true},
                },
                banned: {
                  select: {username: true,status: true,avatarUrl: true,id: true},
                },
              },
            });
            return source
          } catch (error) {
            console.log('get__channels error:', error);
          }
        }

        async get__chanNamebyId(id : number) {
          try {
            const source = await this.prisma.channel.findUnique({
              where: {
                id : id,
              },
              select: {
                channelName: true,
              },
            });
            return source
          } catch (error) {
            console.log('get__channels error:', error);
          }
        }

        async getChannelProtection(id : number) {
          try {
            const source = await this.prisma.channel.findUnique({
              where: {
                id : id,
              },
              select: {
                password: true,
                members:true,
              },
            });
            return source
          } catch (error) {
            console.log('get__channels error:', error);
          }
        }

        async get__MsgIn(id : number, blockedUser:number[]) {
          try {
            const source = await this.prisma.channel.findMany({
              where: {
                id : id,
              },
              select: {
                messages: {
                  where:{
                    userId:{
                      notIn:blockedUser,
                    }
                  },
                  select: {
                    id: true,
                    createdAt: true,
                    message: true,
                    userId: true,
                    channelId: true,
                    owner:{
                      select:{
                        username:true,
                        avatarUrl:true,
                      },
                    },
                  },
                },
              },
            });
            return source
          } catch (error) {
            console.log('get__channels error:', error);
          }
        }

        async get__UserBanIn(id : number) {
          try {
            const source = await this.prisma.channel.findMany({
              where: {
                id : id,
              },
              select: {
                banned: true,
              },
            });
            return source;
          } catch (error) {
            console.log('get__channels error:', error);
          }
        }

        

        
        async update_chan(info: EditChannelCreateDto) {

            const idchat = info.channelid;
            // if (info.isPrivate == undefined)
            //   info.isPrivate = false;
            // const isPass = info.isPassword.valueOf();
            let hash = "";
            if (info.Password != undefined && info.Password != null && info.Password != "")
            {
              const salt = await bcrypt.genSalt();
              hash = await bcrypt.hash(info.Password, salt);
              // console.log("hash updated !:" + hash);
              info.isPassword = true;
            }
            else
            {
              // console.log("IS PASSWORD NULL ?");
              info.isPassword = false;
            }
            // console.log("isPass : ", isPass);
            if (await this.isAdmin_Chan(info.username, info.channelid) == true)
            {
              if (info.isPassword)
                if (!info.Password)
                  return (1);
              if (hash == "")
                hash = null;
              await this.prisma.channel.update(
                {
                  where: {
                    id: idchat,
                  },
                  data: {
                    password : hash,
                    isPassword : info.isPassword,
                    // isPrivate : info.isPrivate,
                    //isPrivate : info.Private,
                  }
                }
              )
              // if (info.newname)
              // {  
              //   await this.prisma.channel.update(
              //     {
              //       where: {
              //         id: idchat,
              //       },
              //       data: {
              //         channelName : info.newname,
              //       },
              //     }
              //   )
              // }
              return (0);
            }
            else
              return (2);
          }

          async userIsInChan(token:string, id_channel:number):Promise<boolean>{
            const channels = await this.prisma.user.findUnique({
              where:{
                accessToken:token
              },
              select:{
                members:true
              }
            })
            for (let i = 0; i < channels.members.length; i++){
              if (channels.members[i].id === id_channel)
                return true;
            }
            return false;
          }

          async userIsChanMuted(token:string, id_channel:number):Promise<boolean>{
            const channels = await this.prisma.user.findUnique({
              where:{
                accessToken:token
              },
              select:{
                muted:true
              }
            })
            for (let i = 0; i < channels.muted.length; i++){
              if (channels.muted[i].id === id_channel)
                return true;
            }
            return false;
          }

          async getUsername(token:string){
            return this.prisma.user.findUnique({
              where: {
                accessToken: token,
              },
              select: {
                username: true,
              },
            });
          }

          async getPeopleToInvite(token:string, channelId:number){
            const friends = await this.prisma.user.findUnique({
              where: {
              accessToken: token,
              },
              select: {
                friends: true,
              },
            });

            const userToInvite = friends.friends.map(async (id_user:number) => {
              const user = await this.prisma.user.findUnique({
                where:{
                  id:id_user,
                },
                select:{
                  username:true,
                  admins:{
                    select:{
                      id:true,
                    }
                  },
                  members:{
                    select:{
                      id:true,
                    }
                  },
                  muted:{
                    select:{
                      id:true,
                    }
                  },
                  banned:{
                    select:{
                      id:true,
                    }
                  },
                }
              });
              if (user.admins.find((elem:any) => {return elem.id === channelId}) === undefined &&
                  user.members.find((elem:any) => {return elem.id === channelId}) === undefined &&
                  user.muted.find((elem:any) => {return elem.id === channelId}) === undefined &&
                  user.banned.find((elem:any) => {return elem.id === channelId}) === undefined
              ){
                // console.log(user);
                return user.username;
              }
              return;
            })
            return Promise.all(userToInvite);
          }

          // async getUserToDm(token:string){
          //   const useralreadydm = await this.prisma.user.findMany({
          //     where:{
          //       accessToken:token,
          //     },
          //     select:{
          //       members:{
          //         where:{
          //           isDM:true
          //         },
          //         select:{
          //           members:{
          //             where:{
          //               NOT:{accessToken:token}
          //             },
          //             select:{
          //               username:true,
          //             }
          //           },
          //         }
          //       }
          //     }
          //   })
          // }
          async getUserToDm(token:string){
            const useralreadydm = await this.prisma.channel.findMany({
              where:{
                members:{
                  some:{accessToken:token}
                },
                isDM:true,
              },
              select:{
                members:{
                  where:{
                    NOT:{accessToken:token}
                  },
                  select:{
                    username:true,
                  }
                }
              }
            })

            // console.log(useralreadydm);
            let usernames = [];
            if (useralreadydm.length > 0){
              useralreadydm[0].members.forEach((value:any) => {
                usernames.push(value.username);
              })
            }
            const users = await this.prisma.user.findMany({
              where:{
                AND:{
                  username:{
                    notIn:usernames,
                  },
                  NOT:{accessToken:token}
                }
              },
              select:{
                username:true,
              }
            })
            // console.log(users);
            let values = []
            users.forEach((value:any) => {
              values.push(value.username);
            })
            return (values);
          }

        async createDmChannel(username1:string, username2:string){
          const channel = await this.prisma.channel.create({
            data:{
              channelName:username1+","+username2,
              password:'',
              isPrivate:true,
              isDM:true,
              owner: {
                connect: [{username : username1},{username:username2}]
              },
              admins: {
                connect: [{username : username1},{username:username2}]
              },
              members: {
                connect: [{username : username1},{username:username2}]
              }
            }
          });
          return channel;
        }

        async isDM(channelId:number){
          const value = await this.prisma.channel.findUnique({
            where:{
              id:channelId,
            },
            select:{
              isDM:true,
            }
          })
          return value.isDM;
        }

        async getUserBlocked(token:string){
          const usersBlocked = await this.prisma.user.findUnique({
            where:{
              accessToken:token,
            },
            select:{
              blocked:true,
            }
          })
          return usersBlocked.blocked;
        }

        async getExceptUser(channelId:number, id_user:number){
          const users = await this.prisma.user.findMany({
            where:{
              blocked:{
                has:id_user,
              },
              OR:[
                {owner:{ some: {id:channelId} }},
                {admins:{ some: {id:channelId} }},
                {members:{ some: {id:channelId} }},
                {muted:{ some: {id:channelId} }},
              ],
            },
            select:{
              username:true,
            }
          });
          return users;
        }

        async playMatchWithFriends(client:Socket, username:string, channelId:number, server:Server){
          const users = await this.prisma.channel.findMany({
            where:{
              id:channelId,
              isDM:true,
            },
            select:{
              admins:{
                select:{
                  username:true,
                }
              }
            }
          });
          if (users.length === 0 || users[0].admins.length === 0 || 
            (users[0].admins[0].username !== username && users[0].admins[1].username !== username))
            return;
          const room = await this.WsGameService.createRoomWithFriends(users[0].admins[0].username, users[0].admins[1].username);
          return room;
        }
  }
