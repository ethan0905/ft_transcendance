import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, //block any other type variables
  })); // in order to use NestJs builtin pipes

  var cors = require('cors'); //for connectivity with frontend
  // const corsOptions = {
  //   origin: 'http://localhost:3000',
  //   credentials: true, // allow cookies to be sent cross-origin
  // };
  
  // app.use(cors(corsOptions));
  
  // app.use('/ws-game', createProxyMiddleware({ target: 'http://localhost:4343', changeOrigin: true }));

  app.use(cors());
  app.use(cookieParser()); //for cookies

  await app.listen(3333);
}
bootstrap();
