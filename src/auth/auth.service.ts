import { Injectable } from '@nestjs/common';
import { UsuarioEntity } from 'src/app/usuario/usuario.entity';
import { UsuarioService } from 'src/app/usuario/usuario.service';
import { compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
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

        const token = this.jwtService.sign(payload);

        // Configurando o cookie

        response.cookie('jwt', token, {

            httpOnly: true,  // Impede acesso via JavaScript no cliente

            secure: process.env.NODE_ENV === 'production',  // HTTPS apenas em produção

            sameSite: 'strict',  // Proteção contra CSRF

            maxAge: 1 * 60 * 60 * 1000, // 1 hora

        });

        return {

            message: 'Login realizado com sucesso',
            statusCode: 200

        };

    }
}
