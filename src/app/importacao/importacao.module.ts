import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportacaoController } from './importacao.controller';
import { ImportacaoService } from './importacao.service';
import { ImportacaoEntity } from './importacao.entity';
import { ReceitaEntity } from '../receita/receita.entity';
import { DespesaEntity } from '../despesa/despesa.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ImportacaoEntity,
      ReceitaEntity,
      DespesaEntity
    ]),
  ],
  controllers: [ImportacaoController],
  providers: [ImportacaoService],
  exports: [ImportacaoService],
})
export class ImportacaoModule { }
