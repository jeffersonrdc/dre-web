import { Injectable, NotFoundException } from '@nestjs/common';
import { FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsuarioEntity } from './usuario.entity';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(UsuarioEntity)
        private usuarioRepository: Repository<UsuarioEntity>,
    ) { }

    async findAll(): Promise<UsuarioEntity[]> {
        return await this.usuarioRepository.find({ select: ['ID_Usuario', 'NM_Email'] });
    }

    async findOneOrFail(options: FindOneOptions<UsuarioEntity>): Promise<UsuarioEntity> {
        try {
            return await this.usuarioRepository.findOneOrFail(options);
        } catch (error) {
            throw new NotFoundException(error.message);
        }

    }

    async store(data: CreateUsuarioDto): Promise<UsuarioEntity> {
        const usuario = await this.usuarioRepository.create(data);
        return await this.usuarioRepository.save(usuario);
    }

    async update(id: number, data: UpdateUsuarioDto): Promise<UsuarioEntity> {
        const user = await this.findOneOrFail({ where: { ID_Usuario: id } });
        this.usuarioRepository.merge(user, data);
        return await this.usuarioRepository.save(user);
    }

    async delete(id: number): Promise<void> {
        await this.findOneOrFail({ where: { ID_Usuario: id } });
        this.usuarioRepository.delete(id);
    }

}
