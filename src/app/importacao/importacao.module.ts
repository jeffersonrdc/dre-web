import { Module } from '@nestjs/common';
import { ImportacaoController } from './importacao.controller';
import { ImportacaoService } from './importacao.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportacaoEntity } from './importacao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ImportacaoEntity])],
  controllers: [ImportacaoController],
  providers: [ImportacaoService],
  exports: [ImportacaoService]
})
export class ImportacaoModule {}
