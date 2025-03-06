import { Injectable } from '@nestjs/common';
import { UsuarioEntity } from 'src/app/usuario/usuario.entity';
import { UsuarioService } from 'src/app/usuario/usuario.service';
import { compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { mensagemHelper } from 'src/helpers/mensagem.helper';
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

    /* async login(usuario: UsuarioEntity) {
        const payload = {
            sub: usuario.ID_Usuario
        };

        return {
            token: this.jwtService.sign(payload)
        };
    } */

    async login(user: any, response: Response) {


        const payload = { sub: user.ID_Usuario };

        const token = this.jwtService.sign(payload, { expiresIn: process.env.JWR_EXPIRE_IN }); // Token de acesso dura 1 hora
        const refreshToken = this.jwtService.sign(payload, { expiresIn: process.env.REFRESH_JWR_EXPIRE_IN }); // Refresh token dura 7 dias

        //const token = this.jwtService.sign(payload);

        // Configurando o cookie

        response.cookie('jwt', token, {

            httpOnly: true,  // Impede acesso via JavaScript no cliente

            secure: process.env.NODE_ENV === 'production',  // HTTPS apenas em produção

            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',  // Proteção contra CSRF

            maxAge: 1 * 60 * 60 * 1000, // 1 hora

        });

        // 🔹 Configura o cookie para o refresh token
        response.cookie('refreshToken', refreshToken, {
            httpOnly: true,  // Impede acesso via JavaScript no cliente

            secure: process.env.NODE_ENV === 'production',  // HTTPS apenas em produção

            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'none',  // Proteção contra CSRF

            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        });

        return {

            message: mensagemHelper.login.success,
            statusCode: 200

        };

    }
}
