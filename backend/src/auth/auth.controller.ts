import { PrismaService } from './../prisma/prisma.service';
import { Body, Controller, Post, Get, ParseIntPipe, HttpCode, HttpStatus, Req, Res, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthDto, Auth42Dto } from './dto';
import { UserService } from '../user/user.service';

@Injectable()
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
              private prismaService: PrismaService,
              private userService: UserService ) {}

  // @HttpCode(HttpStatus.OK) //send a 200 code for clarity

  @Get('42/callback')
  async getToken( @Req() req: Request, @Res() res: Response) {

    const code = req.query.code as string;
    // console.log('req.query.code = ' + code);
    // console.log('\n');

    const token = await this.authService.accessToken(code);
    // console.log(token);
    // console.log('\n');

    const user = await this.authService.get42User(
      token.access_token,
    );
    // console.log(user.email);
    // console.log('\n');

    if (token)
    {
      // console.log("Token exists, so we create cookies! \n\n");
      this.authService.createCookies(res, token);
    }

    // this.authService.updateCookies(res, token, user);

    if (!user.email)
    {
      // const user42 = await this.authService.create42User(token, user);
      // if (user42)
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
    else {
      
      const userExist = await this.authService.findUserByEmail(user.email);
      if (!userExist)
      {
        // console.log("User does not exist, so we create it! \n\n");
        const user42 = await this.authService.create42User(token, user);
      }
      else
      {
        // console.log("User already exists, so we update it! \n\n");
        this.authService.updateCookies(res, token, user);
      }

      const updatedUser = await this.authService.findUserByEmail(user.email);

      // this.authService.updateCookies(res, token, user);
      if (updatedUser.twoFactorActivated === false)
      {
        // console.log("Hello 1\n");
        req.headers.authorization = token.access_token;
        this.userService.updateUserStatusOnline(req);
        // console.log(`url: ${process.env.FRONTEND_URL}/myProfile`)
        res.redirect(
          `${process.env.FRONTEND_URL}/myProfile`,
          );
      }
      else if (updatedUser.twoFactorActivated === true)
      {
        // console.log("Hello 2\n");
        req.headers.authorization = token.access_token;
        this.userService.updateUserStatusOnline(req); // to test
        res.redirect(
          `${process.env.FRONTEND_URL}/2fa/verification`,
          );
      }

      return { token: token, user: user };
    }
  }

  @Get('42/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    // req.headers.authorization = res.cookie.("token");
    req.headers.authorization = req.cookies['token'];
    // console.log("req.headers.authorization = " + req.headers.authorization);

    this.authService.deleteCookies(res);
    this.userService.updateUserStatusOffline(req);
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  }

  @Get('2fa/status')
  async get2FAStatus(@Req() req: Request) {
    return this.authService.get2FAStatus(req);
  }

  @Post('2fa/enable')
  async enable2FA(@Req() req: Request, @Res() res: Response) {
    return this.authService.enable2FA(req, res);
  }

  @Post('2fa/activated')
  async activate2FA(@Req() req: Request, @Res() res: Response) {
    return this.authService.activate2FA(req, res);
  }

  @Post('2fa/generate')
  async generate2FA(@Req() req: Request, @Res() res: Response) {
    return this.authService.generate2FA(req, res);
  }

  @Get('2fa/qrcode')
  async generateQrCodeDataURL(otpAuthUrl: any) {
    return this.authService.generateQrCodeDataURL(otpAuthUrl);
  }

  @Post('2fa/verify')
  async verify2FA(@Req() req: Request) {
    return this.authService.verify2FA(req);
  }

  @Get('42/verify')
  async checkIfUserAuthenticated(@Req() req: Request) {
    return this.authService.checkIfUserAuthenticated(req);
  }

  @Post('2fa/success')
  async loginSucceeded(@Req() req: Request) {
    return this.authService.loginSucceeded(req);
  }
}
