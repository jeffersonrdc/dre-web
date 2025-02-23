import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { mensagemHelper } from "src/helpers/mensagem.helper";

export class CreateImportacaoDto {
    @IsNumber({}, { message: mensagemHelper.importacao.contaBancaria.invalid_number })
    @Min(1, { message: mensagemHelper.importacao.contaBancaria.invalid }) // Adiciona a validação para garantir que seja maior que 0
    @Type(() => Number) // Tenta garantir a transformação automática
    ID_ContaBancaria: number;
}
