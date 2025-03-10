import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsuarioModule } from 'src/app/usuario/usuario.module';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt_strategy';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
@Module({
  imports: [
    ConfigModule.forRoot(),
    UsuarioModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWR_EXPIRE_IN },

    })
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtAuthGuard], // Os providers são os serviços que serão injetados no módulo, neste caso, precisamos injetar o AuthService e o LocalStrategy com o @Injectable
  controllers: [AuthController] // Os controllers são os controladores que serão injetados no módulo, neste caso, precisamos injetar o AuthController
})
export class AuthModule { }
