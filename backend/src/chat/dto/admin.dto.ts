import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEmail, IsArray, IsNumber } from 'class-validator';

export class ChannelBanMemberDto {
	@IsNotEmpty()
	@IsString()
	public user_id: string = "";
}

export class ChannelDelegateOwnershipDto {
	@IsNotEmpty()
	@IsString()
	public user_id: string = "";
}

export class ChannelDemoteOperatorDto {
	@IsNotEmpty()
	@IsString()
	public user_id: string = "";
}

export class ChannelKickMemberDto {
	@IsNotEmpty()
	@IsString()
	public user_id: string = "";
}

export class ChannelUnbanMemberDto {
	@IsNotEmpty()
	@IsString()
	public user_id: string = "";
}

export class IsAdminDto {
	@IsNotEmpty()
	@IsString()
	public username: string;

	@IsNotEmpty()
	@IsNumber()
	public channel_id: number;
}
