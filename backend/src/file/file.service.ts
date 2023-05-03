import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { Req } from '@nestjs/common';
import { UploadedFile } from '@nestjs/common';

@Injectable()
export class FileService {
	constructor(private prisma: PrismaService) {}

	// async uploadAvatar(file: UploadedFile, req: Request) {
	// 	const user = await this.prisma.user.update({
	// 		where: {
	// 			id: req.user.id,
	// 		},
	// 		data: {
	// 			avatar: file.filename,
	// 		},
	// 	});
	// 	return user;
	// }
}
