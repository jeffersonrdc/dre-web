import { Injectable } from '@nestjs/common';
import { DespesaEntity } from './despesa.entity';   
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DespesaService {
    constructor(
        @InjectRepository(DespesaEntity)
        private despesaRepository: Repository<DespesaEntity>,
    ) {}

    async findAll(): Promise<DespesaEntity[]> {
        return await this.despesaRepository.find({ select: ['ID_Despesa', 'DT_Lancamento', 'VL_Despesa'] });
    }

    
}