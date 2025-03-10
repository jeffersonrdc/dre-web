import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioEntity } from './usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@Controller('api/usuario')
//@UseGuards(AuthGuard('jwt'))
@UseGuards(JwtAuthGuard) // ✅ Agora usa o JwtAuthGuard
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) { }


    @Get()
    async index(): Promise<UsuarioEntity[]> {
        return await this.usuarioService.findAll();
    }
    @Post()
    async store(@Body() body: CreateUsuarioDto): Promise<UsuarioEntity> {
        return await this.usuarioService.store(body);
    }
    @Get(':ID_Usuario')
    async show(@Param('ID_Usuario') ID_Usuario: number): Promise<UsuarioEntity> {
        return await this.usuarioService.findOneOrFail({ where: { ID_Usuario } });
    }
    @Put(':ID_Usuario')
    async update(@Param('ID_Usuario') ID_Usuario: number, @Body() body: UpdateUsuarioDto): Promise<UsuarioEntity> {
        return await this.usuarioService.update(ID_Usuario, body);
    }
    @Delete(':ID_Usuario')
    @HttpCode(HttpStatus.NO_CONTENT)
    async destroy(@Param('ID_Usuario') ID_Usuario: number) {
        await this.usuarioService.delete(ID_Usuario);
    }
}
