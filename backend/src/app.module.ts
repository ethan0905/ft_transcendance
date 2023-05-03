import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; 
import { AuthModule } from "./auth/auth.module";
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { FileModule } from './file/file.module';
import { WsGameModule } from './ws_game/ws_game.module';
import { ScheduleModule } from '@nestjs/schedule';

// A module is a class anotated with a @Module decorator. The module decorator provide
// metadata that Nest makes use of to organize the application structure
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // does the same thing as @Global export decorator, allow us to access to nestJs ConfigModule inside other modules
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    ChatModule,
    FileModule,
    WsGameModule,
    ScheduleModule.forRoot()
  ],
})
 
export class AppModule {}
