import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEmail, IsArray, IsNumber, isNotEmpty, isNumber } from 'class-validator';

export class ChannelMessageSendDto {
    @IsNotEmpty()
    @IsNumber()
    chatId : number;

	@IsNotEmpty()
	@IsString()
	public msg: string = "";
}


export class DmMsgSend {
    @IsNotEmpty()
    @IsEmail()
    public target: string = "";

    @IsNotEmpty()
    @IsEmail()
    public mail: string = "";

	@IsNotEmpty()
	@IsString()
	public msg: string = "";
}