import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdateUsuarioDto {
    @IsEmail()
    @IsNotEmpty()
    @IsString()
    NM_Email: string;
    
}