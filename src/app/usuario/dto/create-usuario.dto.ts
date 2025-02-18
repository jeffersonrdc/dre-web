import { IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";
import { mensagemHelper } from "src/helpers/mensagem.helper";
import { regexHelper } from "src/helpers/regex.helper";

export class CreateUsuarioDto {
    @IsEmail()
    @IsNotEmpty({ message: mensagemHelper.usuario.email.required })
    @IsString()
    NM_Email: string;

    @IsNotEmpty({ message: mensagemHelper.usuario.senha.required })
    @IsString()
    @Matches(regexHelper.password, { message: mensagemHelper.usuario.senha.invalid })
    NM_Senha: string;
}
