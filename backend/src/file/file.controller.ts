import { Controller, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Get, Param, Res, Req } from '@nestjs/common';
import { Response } from 'express';
import { UploadedFile } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Multer } from 'multer'; // npm i --save-dev @types/multer if error 
// import sharp from 'sharp';
import * as sharp from 'sharp';

@Controller('files')
export class FileController {
  constructor(private readonly prisma: PrismaService) {}

  @Post(':username/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Param('username') username: string, @UploadedFile() file: Multer.File) {

    // Get user by username
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const searchFileTest = await this.prisma.file.findFirst({
      where: {
        owner: {
          some: {
            id: user.id,
          },
        },
      },
    });
    
    if (searchFileTest) {
      await this.prisma.file.delete({
        where: {
          id: searchFileTest.id,
        },
      });
      // console.log("File already existed for this user, so we deleted it!");
    }

    const newFile = await this.prisma.file.create({
      data: {
        content: file.buffer,
        filename: file.originalname,
        mimetype: file.mimetype,
        owner: {
          connect: {
            id: user.id,
          }
        },
      },
    });
  
    // console.log("New file has been uploaded!");

    return newFile;
  }

@Get(':username')
async serveFile(@Param('username') username: string, @Res() res: Response) {

  try {
    // Get user by username
    const user = await this.prisma.user.findUnique({
      where: {
        username,
      },
    });
  
    if (!user) {
      // console.log("User not found");
      // throw new Error('User not found');
    }

    const searchFileTest = await this.prisma.file.findFirst({
        where: {
          owner: {
            some: {
              id: user.id,
            },
          },
        },
      });

      if (!searchFileTest) {
        // console.log("File not found");
        res.status(404).send('File not found');
        return { status: false };
      }

      // Resize image to 200x200
      // console.log("searchFileTest.content ---> ", searchFileTest);
      const imageBuffer = await sharp(searchFileTest.content)
      .resize(200, 200, { fit: 'cover' })
      .toBuffer();
    
      res.setHeader('Content-Type', searchFileTest.mimetype);
      res.send(imageBuffer);

    } catch (error) {
      console.log("error ---> ", error);
      res.status(404).send('File not found');
      return { status: false };
    }


  }
}

// the previous code is working, but I want to switch to :username 
//   @Get(':id')
//   async serveFile(@Param('id') id: string, @Res() res: Response) {

// 	const fileId = parseInt(id, 10);

//     const file = await this.prisma.file.findUnique({
//       	where: {
// 			id: fileId,
// 		},
//     });
//     if (!file) {
//       res.status(404).send('File not found');
//       return;
//     }
//     res.setHeader('Content-Type', file.mimetype);
//     res.send(file.content);
//   }
// }

// @Post(':username/upload')
// @UseInterceptors(FileInterceptor('file'))
// async uploadFile(@Param('username') username: string, @UploadedFile() file: Multer.File) {
//   console.log("username ---> ", username);

//   // Get user by username
//   const user = await this.prisma.user.findUnique({
//     where: {
//       username,
//     },
//   });

//   if (!user) {
//     throw new Error('User not found');
//   }

// // Delete previous file if it exists
// const previousFile = await this.prisma.file.findFirst();
// if (previousFile) {
//   await this.prisma.file.delete({
// 	where: {
// 	  id: previousFile.id,
// 	},
//   });
// }

//   const newFile = await this.prisma.file.create({
//     data: {
//       content: file.buffer,
//       filename: file.originalname,
//       mimetype: file.mimetype,
//     },
//   });

//   return newFile;
// }