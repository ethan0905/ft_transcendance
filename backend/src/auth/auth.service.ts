/* eslint-disable prettier/prettier */
import { Injectable, ForbiddenException, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto, Auth42Dto } from './dto';
// import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { UserService } from '../user/user.service';
import { HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { Body } from '@nestjs/common';
import { join } from 'path';
import { readFileSync } from 'fs';
import fetch from 'node-fetch';
import axios from 'axios';

@Injectable()
export class AuthService{
	constructor(
		private prisma: PrismaService,
		private userService: UserService,
		private jwt: JwtService,
		private config: ConfigService,
	) {}

	// async signToken(userId: number, email: string): Promise<{access_token: string}> {
	// 	const payload = {
	// 		sub: userId,
	// 		email,
	// 	};
	// 	const secret = this.config.get('JWT_SECRET');

	// 	const token = await this.jwt.signAsync(
	// 		payload, {
	// 			expiresIn: '15min',
	// 			secret: secret,
	// 		},
	// 	);

	// 	return {
	// 		access_token: token,
	// 	};
	// }

	async accessToken(req: string) {

		try {
		  const response = await fetch("https://api.intra.42.fr/oauth/token", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: `grant_type=authorization_code&client_id=${process.env.API42_CLIENT_ID}&client_secret=${process.env.API42_CLIENT_SECRET}&code=${req}&redirect_uri=${process.env.API42_REDIRECT_URI}`,
		  });
		  const data = await response.json();
		  if (!data)
		  {
			throw new HttpException(
			  {
				status: HttpStatus.BAD_REQUEST,
				error: "Empty token"
			  },
			   HttpStatus.BAD_REQUEST); 
			};
		  return data;
		} catch (error) {
		  throw new HttpException(
			{
			  status: HttpStatus.BAD_REQUEST,
			  error: "Error while getting the user with token"},
			 HttpStatus.BAD_REQUEST); 
			};
		}

	async get42User(accessToken: string) {

		try {
			const response = await fetch("https://api.intra.42.fr/v2/me", {
			method: "GET",
			headers: { Authorization: `Bearer ${accessToken}` },
			});
			if (!response.ok) {
			throw new HttpException(
				{
				status: HttpStatus.BAD_REQUEST,
				error: "Empty 42 user datas"
				},
				HttpStatus.BAD_REQUEST); 
			}
			const data = await response.json();
			// console.log("get42User(): \n", data.image.versions.medium);
			return data;
		} catch (error) {
			throw new ForbiddenException("Invalid token");
		}
	}

	async create42User(token: any, user42: any) {
		try {
			// console.log("Creating user... \n");	

			// if (user42.email)
			// 	return user42;

			// console.log("user image url : ", user42.image.versions.medium);

			const user = await this.prisma.user.create({
				data: {
					email: user42.email,
					username: user42.login,
					accessToken: token.access_token,
					refreshToken: token.refresh_token,
					twoFactorAuth: false,
					twoFactorActivated: false,
					avatarUrl: user42.image.versions.medium,
				},
			});
	
			// console.log("User 42 has been created!\n");

			console.log("Converting image to File object... \n");

			const imageUrl = user42.image.versions.medium; // replace with your image URL

			// Fetch the image data and convert it to a blob
			const response = await fetch(imageUrl);
			const imageBlob = await response.blob();

			// Create a FormData object and append the image to it
			const formData = new FormData();
			formData.append('file', imageBlob, 'image.png'); // the second argument is the file name

			// console.log("FormData created!", formData);

			// // Make a POST request to the uploadFile endpoint with the FormData object as the request body
			const username = user42.login; // replace with the username
			const uploadUrl = `http://localhost:3333/files/${username}/upload`;
			// console.log("before api call-----");
			const uploadResponse = await axios.post(uploadUrl, formData);
			// const newFile = uploadResponse.data;
			// console.log('New file:', newFile);

			console.log("File object created!\n");

			// delete user.accessToken;
			// delete user.refreshToken;

			return user;
		}catch (error) {
			if (error instanceof PrismaClientKnownRequestError) {
				if (error.code === 'P2002') {
					throw new ForbiddenException('Credentials taken');
				}
			}
		};
	}

	async findUserByEmail(user42: any) {
		try {
			const user = await this.prisma.user.findFirst({
				where: {
					email: user42,
				},
			});
			return user;
		} catch (error) {
			throw new HttpException(
				{

				status: HttpStatus.BAD_REQUEST,
				error: "Error while finding user in the database"
				}, HttpStatus.BAD_REQUEST);
		};
	}

	async createCookies(@Res() res: Response, token: any) {
		// console.log("Creating cookies with: [" + token.access_token + "]\n");
		const cookies = res.cookie("token", token.access_token,
		{
		  expires: new Date(new Date().getTime() + 60 * 24 * 7 * 1000), // expires in 7 days
		//   httpOnly: true, // for security
		  httpOnly: false, // for security
		});
		// const Googlecookies = res.cookie("FullToken", token,
		// {
		//   expires: new Date(new Date().getTime() + 60 * 24 * 7 * 1000), // expires in 7 days
		//   httpOnly: true, // for security
		// });
	}

	async updateCookies(@Res() res: Response, token: any, user42: any) {
		try {
		  if (user42)
		  {
			const user = await this.prisma.user.update({
				where: {
					email: user42.email,
				},
				data: {
					accessToken: token.access_token,
				},
			});
			return user;
		  }
		  else
			return (null);
		} catch (error)
		{
			throw new HttpException({
			status: HttpStatus.BAD_REQUEST,
			error: "Error to update the cookes"},
			HttpStatus.BAD_REQUEST);
		}
	}

	async deleteCookies(@Res() res: Response) {
		res.clearCookie("token");
	}

	async get2FAStatus(@Req() req: Request) {
		try {
			
			const status = await this.prisma.user.findFirst({
				where: {
					accessToken: req.headers.authorization,
				},
				select: {
					twoFactorAuth: true,
					twoFactorActivated: true,
				},
			});

			return status;
		} catch (error) {
			throw new HttpException({
				status: HttpStatus.BAD_REQUEST,
				error: "Error to get the 2FA status"},
				HttpStatus.BAD_REQUEST);
		}
	}

	async enable2FA(@Req() req: Request, @Res() res: Response) {

		// console.log("Getting my Token from req.body.twoFactorAuth: ", req.body.twoFactorAuth);
		// console.log("Getting my Token from req.cookies.token: ", req.body.token);

		const user = await this.prisma.user.update({
			where: {
				accessToken: req.body.token,
			},
			data: {
				twoFactorAuth: req.body.twoFactorAuth,
			},
		});

	}

	async activate2FA(@Req() req: Request, @Res() res: Response) {

		// console.log("99998888---> ", req.body.twoFactorActivated);

		const user = await this.prisma.user.update({
			where: {
				accessToken: req.body.token,
			},
			data: {
				twoFactorActivated: req.body.twoFactorActivated,
			},
		});
	}

	async generate2FA(@Req() req: Request, @Res() res: Response) {
		
		const user = await this.prisma.user.findFirst({
			where: {
				accessToken: req.body.token,
			},
		});

		if (user.twoFactorAuth == true)
		{
			const secret = authenticator.generateSecret();
			await this.prisma.user.update({
				where: {
					accessToken: req.body.token,
				},
				data: {
					twoFactorSecret: secret,
				},
			});

			const twoFactorSecret = await this.prisma.user.findFirst({
				where: {
					accessToken: req.body.token,
				},
				select: {
					twoFactorSecret: true,
				},
			});

			// console.log("User.twofactorsecret : ", twoFactorSecret.twoFactorSecret);

			if (twoFactorSecret.twoFactorSecret == null)
				return {message: "Error while enabling 2FA"};

			const otpauthUrl = authenticator.keyuri(user.email, 'Konoha Pong', twoFactorSecret.twoFactorSecret);
			// console.log("otpauthUrl: ", otpauthUrl);

			return res.json(
				await this.generateQrCodeDataURL(otpauthUrl)
			);
		}
	}

	async generateQrCodeDataURL(otpAuthUrl: string): Promise<string> {
		return toDataURL(otpAuthUrl);
	}

	async verify2FA(@Req() req: Request) {
		
		const user = await this.prisma.user.findFirst({
			where: {
				accessToken: req.body.token,
			},
		});

		// console.log("user to verify:  ", user.email);
		// console.log("access token to verify:  ", req.body.token);
		// console.log("authenticator code to verify:  ", req.body.twoFACode);

		return authenticator.verify({
		  token: req.body.twoFACode, // the code the user enters
		  secret: user.twoFactorSecret,
		});
	  }

	  async checkIfUserAuthenticated(@Req() req: Request) {
		  
		// console.log("Is user authenticated ? ", req.headers.authorization);
		try {
			const user = await this.prisma.user.findFirst({
				where: {
					accessToken: req.headers.authorization,
				},
			});
			if (!user)
				throw new HttpException('User not found', HttpStatus.NOT_FOUND);
			delete user.accessToken;
			return user;
		} catch (error) {
			console.log(error);
			throw new HttpException('User not found', HttpStatus.NOT_FOUND);
		}

		// return userEmail || null;
	  }

	  async loginSucceeded(@Req() req: Request) {
		try {
			await this.prisma.user.update({
				where: {
					accessToken: req.body.token,
				},
				data: {
					twoFactorVerified: req.body.status,
				},
			});
	
			return { message: "Login with 2FA Succeeded" };
		} catch (error) {
			console.log(error);
			throw new HttpException('Error while connecting user', HttpStatus.INTERNAL_SERVER_ERROR);
		}

	}

}