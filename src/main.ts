import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['https://app.mastersdevs.com.br', 'http://localhost:3000'],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type',  // Adiciona Accept aqui
    exposedHeaders: 'Access-Control-Allow-Origin', // 🔥 Adicionando exposedHeaders
  });
  
  app.useGlobalPipes(new ValidationPipe({ // garente que os dados da requisição sejam validados e qualquer erro será tratado pelo NestJS
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true, // Ativa a conversão automática de tipos
  }));
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
