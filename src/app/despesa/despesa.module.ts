import { Module } from '@nestjs/common';
import { DespesaController } from './despesa.controller';
import { DespesaService } from './despesa.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DespesaEntity } from './despesa.entity';

@Module({ 
  imports: [TypeOrmModule.forFeature([DespesaEntity])],
  controllers: [DespesaController],
  providers: [DespesaService],
  exports: [DespesaService]
})
export class DespesaModule {}
