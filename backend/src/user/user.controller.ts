import { Controller, Get, UseGuards, Req, Patch, Body, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { UserService } from './user.service';
import { FriendDto } from './dto/friend.dto';
import { GetFriendDTO } from './dto/friend.dto';
import { BlockDto } from './dto/friend.dto';

// @UseGuards(JwtGuard)
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {} //dependency injection

	@Get('me/username/get')
	getUsername(@Req() req: Request) {
		return this.userService.getUsername(req);
	}

	@Post('me/username/edit')
	editUsername(@Req() req: Request) {
		return this.userService.editUsername(req);
	}

	@Get('me/email/get')
	getEmail(@Req() req: Request) {
		return this.userService.getEmail(req);
	}
	@Get('me/id/get')
	getId(@Req() req: Request) {
		return this.userService.getId(req);
	}

	@Get('username/get')
	getUserNameById(@Req() req: Request) {
		return this.userService.getUserNameById(req);
	}

	@Get('username/valid')
	userExistsInDatabase(@Req() req: Request) {
		return this.userService.userExistsInDatabase(req);
	}

	@Get('id/get')
	getUserIdByUserName(@Req() req: Request) {
		return this.userService.getUserIdByUserName(req);
	}

	// friend part
	@Post('me/friend/add')
	addFriend(@Body() data : FriendDto)
	{
		return this.userService.addFriend(data);
	}

	@Post('me/friend/remove')
	removeFriend(@Body() data : FriendDto)
	{
		return this.userService.removeFriend(data);
	}

	@Get('me/friend/status/get')
	getFriendStatusById(@Req() req: Request)
	{
		return this.userService.getFriendStatusById(req);
	}

	// block part
	@Post('me/user/block')
	blockUser(@Body() data : BlockDto)
	{
		return this.userService.blockUser(data);
	}

	@Post('me/user/unblock')
	unblockUser(@Body() data : BlockDto)
	{
		return this.userService.unblockUser(data);
	}

	@Get('me/block/status/get')
	getBlockStatusById(@Req() req: Request)
	{
		return this.userService.getBlockStatusById(req);
	}

	@Get('me/friend/list/get')
	getFriendListByToken(@Req() req: Request)
	{
		return this.userService.getFriendListByToken(req);
	}
	
	@Get('me/game/history/get')
	getGameHistory(@Req() req: Request)
	{
		return this.userService.getGameHistory(req);
	}

	@Get('me/achievements/get')
	getUserAchievementStatus(@Req() req: Request) {
		return this.userService.getUserAchievementStatus(req);
	}

	@Get('user/status/get')
	getUserStatus(@Req() req: Request) {
		return this.userService.getUserStatus(req);
	}

	@Post('me/status/online/set')
	updateUserStatusOnline(@Req() req: Request) {
		return this.userService.updateUserStatusOnline(req);
	}

	@Post('me/status/offline/set')
	updateUserStatusOffline(@Req() req: Request) {
		return this.userService.updateUserStatusOffline(req);
	}

	@Post('me/status/playing/set')
	updateUserStatusPlaying(@Req() req: Request) {
		return this.userService.updateUserStatusPlaying(req);
		
		// @Get('me/email/get')
		// getmail(@Req() req: Request) {
			// 	return this.userService.getmail(req);
			// }
			// @Get('me/id/get')
			// getid(@Req() req: Request) {
				// 	return this.userService.getid(req);
				// }
				// @Post('me/addfriend')
				// addFriend(@Body() data : FriendDto)
				// {
	// 	console.log("data on Post:", data)
	// 	this.userService.addfriend(data);
	// }
	// @Get('me/getfriend')
	// getFriend(@Body() data :GetFriendDTO)
	// {
		// 	const user = this.userService.getfriend(data)
		// 	return (user)
	}

	@Get('me/avatarurl/get')
	getAvatarUrl(@Req() req: Request) {
		return this.userService.getAvatarUrl(req);
	}

	@Post('me/avatarurl/edit')
	editAvatarUrl(@Req() req: Request) {
		return this.userService.editAvatarUrl(req);
	}

	@Get('me/theme/get')
	getTheme(@Req() req: Request) {
		return this.userService.getTheme(req);
	}

	@Post('me/theme/edit')
	editTheme(@Req() req: Request) {
		return this.userService.editTheme(req);
	}
}
