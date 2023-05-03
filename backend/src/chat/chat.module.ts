import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { ChatController } from './chat.controller';
import { UserModule } from '../user/user.module';
import { PrismaClient } from '@prisma/client';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { WsGameModule } from 'src/ws_game/ws_game.module';

@Module({
	imports: [ UserModule,WsGameModule],
	controllers: [ChatController],
	providers: [ ChatGateway, ChatService, PrismaClient, AuthService, JwtService, UserService ],
	exports: [ ChatService],
})

export class ChatModule {}