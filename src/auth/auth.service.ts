import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuarioEntity } from 'src/app/usuario/usuario.entity';
import { UsuarioService } from 'src/app/usuario/usuario.service';
import { compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { mensagemHelper } from 'src/helpers/mensagem.helper';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class AuthService {
    constructor(private readonly usuarioService: UsuarioService, private readonly jwtService: JwtService) { }

    async validateUser(email: string, senha: string) {
        let usuario: UsuarioEntity;

        try {
            usuario = await this.usuarioService.findOneOrFail({
                where: {
                    NM_Email: email
                }
            });
        } catch (error) {
            return null;
        }

        const senhaValida = compareSync(senha, usuario.NM_Senha);

        if (!senhaValida) {
            return null;
        }

        return usuario;
    }

    async login(user: any, response: Response) {

        const payload = { sub: user.ID_Usuario };

        const token = this.jwtService.sign(payload, { expiresIn: process.env.JWR_EXPIRE_IN }); // Token de acesso dura 1 hora
        // Geração do refresh token com um segredo específico
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.REFRESH_JWT_SECRET, // Usando o segredo específico para o refresh token
            expiresIn: process.env.REFRESH_JWR_EXPIRE_IN // Exemplo: 7 dias
        });
        // Configurando o cookie

        response.cookie('jwt', token, {

            httpOnly: true,  // Impede acesso via JavaScript no cliente

            secure: true,  // HTTPS apenas em produção

            sameSite: 'none',  // Proteção contra CSRF
            /* secure: process.env.NODE_ENV === 'production' ? true : false,  // HTTPS apenas em produção

            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',  // Proteção contra CSRF */

            maxAge: 24 * 60 * 60 * 1000, // 24 hora

        });

        // 🔹 Configura o cookie para o refresh token
        response.cookie('refreshToken', refreshToken, {
            httpOnly: true,  // Impede acesso via JavaScript no cliente

            secure: true,  // HTTPS apenas em produção

            sameSite: 'none',  // Proteção contra CSRF
            /* secure: process.env.NODE_ENV === 'production' ? true : false,  // HTTPS apenas em produção

            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',  // Proteção contra CSRF */

            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        });

        return user = {

            id: user.ID_Usuario,
            name: user.NM_Nome,
            email: user.NM_Email

        };

    }

    /**
     * Renova o token de acesso usando o refresh token armazenado no cookie.
     */
    async refreshToken(request: Request, response: Response) {
        const refreshToken = request.cookies['refreshToken'];

        if (!refreshToken) {
            throw new UnauthorizedException(mensagemHelper.token.refreshToken.notFound);
        }

        try {
            // Verifique com o mesmo segredo usado para gerar o refresh token
            const decoded = this.jwtService.verify(refreshToken, {
                secret: process.env.REFRESH_JWT_SECRET,  // Segredo usado para gerar o refresh token
            });

            const newAccessToken = this.jwtService.sign(
                { sub: decoded.sub },
                { expiresIn: process.env.JWR_EXPIRE_IN }
            );

            response.cookie('jwt', newAccessToken, {
                httpOnly: true,

                secure: true,  // HTTPS apenas em produção

                sameSite: 'none',  // Proteção contra CSRF
                /* secure: process.env.NODE_ENV === 'production' ? true : false,  // HTTPS apenas em produção

                sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',  // Proteção contra CSRF */


                maxAge: 1 * 60 * 60 * 1000, // 1 hora
            });

            return { message: mensagemHelper.token.refreshToken.success, statusCode: 200 };

        } catch (error) {
            throw new UnauthorizedException(mensagemHelper.token.refreshToken.invalid);
        }
    }

    async verificaValidadeToken(request: Request) {
        const token = request.cookies['jwt'];

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

        return { message: mensagemHelper.token.success, statusCode: 204 };


    }

    async logout(response: Response) {

        try {
            // Remover os cookies dos tokens
            response.clearCookie('jwt', {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });

            response.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });

            return { message: mensagemHelper.token.logout.success, statusCode: 200 };

        } catch (error) {
            return { message: mensagemHelper.token.logout.error, statusCode: 500 };
        }
    }
}
