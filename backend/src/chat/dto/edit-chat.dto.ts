import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class EditChannelCreateDto{
    @IsNumber()
    channelid?: number;

    // @IsString()
    // @IsOptional()
    // newname?: string;

    // @IsOptional()
    // @IsBoolean()
    // isPrivate?: boolean;

    @IsOptional()
    @IsBoolean()
    isPassword?: boolean;

    @IsString()
    @IsOptional()
    Password?: string;

    @IsString()
    username?: string;

    // @IsString()
    // @IsOptional()
    // PasswordConfirmation?: string;
}

export class QuitChanDto{
    @IsNumber()
    chatId?: number;
}

export class PlayChanDto{
    @IsNumber()
    chatId?: number;
}

export class ActionsChanDto{
    @IsNumber()
    chatId?: number;

    @IsString()
    username?: string;
}

export class JoinChanDto{
    @IsNumber()
    chatId?: number;

    // @IsTrue()
    // @IsOptional()
    // isPrivate?: boolean;

    @IsString()
    @IsOptional()
    Password?: string;

    // @IsString()
    // @IsOptional()
    // PasswordConfirmation?: string;
}