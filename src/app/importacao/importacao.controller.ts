import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { ImportacaoService } from './importacao.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { CreateImportacaoDto } from './dto/create-importacao.dto';

@Controller('importacao')
@UseGuards(AuthGuard('jwt'))
export class ImportacaoController {
    constructor(private readonly importacaoService: ImportacaoService) { }

    @Post('ofx')
    @UseInterceptors(FileInterceptor('file'))
    async importacaoOFX(@Body() body: CreateImportacaoDto, @UploadedFile() file: Express.Multer.File) {
        return this.importacaoService.importacaoOFX(body, file);
    }

    @Post('csv')
    @UseInterceptors(FileInterceptor('file'))
    async importacaoCSV(@Body() body: CreateImportacaoDto, @UploadedFile() file: Express.Multer.File) {
        return this.importacaoService.importacaoCSV(body, file);
    }
}
