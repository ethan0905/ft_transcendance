import { Module } from "@nestjs/common";
import { JwtModule } from '@nestjs/jwt';
import { UserService } from "src/user/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from './strategy';

@Module({
	imports: [JwtModule.register({})],
	controllers: [AuthController],
	providers: [AuthService, UserService, JwtStrategy],
})
export class AuthModule{}