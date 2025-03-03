import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ // garente que os dados da requisição sejam validados e qualquer erro será tratado pelo NestJS
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, // Ativa a conversão automática de tipos
  }));
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
