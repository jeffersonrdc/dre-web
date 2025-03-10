import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { mensagemHelper } from 'src/helpers/mensagem.helper';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        const token = request.cookies?.jwt;

        // 🔹 Se o token não existir
        if (!token) {
            throw new UnauthorizedException(mensagemHelper.token.notFound);
        }

        try {
            // 🔹 Verifica o token manualmente
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error(mensagemHelper.token.jwt_notfound);
            }
            jwt.verify(token, secret);
            return (await super.canActivate(context)) as boolean;
        } catch (error) {
            // 🔥 Captura erros específicos do JSON Web Token
            if (error instanceof jwt.TokenExpiredError) {
                throw new UnauthorizedException(mensagemHelper.token.invalid);
            }

            if (error instanceof jwt.JsonWebTokenError) {
                throw new UnauthorizedException(mensagemHelper.token.invalid);
            }

            if (error instanceof jwt.NotBeforeError) {
                throw new UnauthorizedException(mensagemHelper.token.noActived);
            }

            // 🔹 Qualquer outro erro
            throw new UnauthorizedException(mensagemHelper.token.other);
        }
    }
}
