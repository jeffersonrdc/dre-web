import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { UsuarioEntity } from "src/app/usuario/usuario.entity";
import { AuthService } from "../auth.service";
import { UnauthorizedException } from "@nestjs/common";
import { mensagemHelper } from "src/helpers/mensagem.helper";
import { Injectable } from "@nestjs/common";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'NM_Email',
            passwordField: 'NM_Senha'
        });
    }

    async validate(email: string, senha: string): Promise<UsuarioEntity> {
        const usuario = await this.authService.validateUser(email, senha);
        if (!usuario) {
            throw new UnauthorizedException(mensagemHelper.login.invalid);
        }
        return usuario;
    }
}
