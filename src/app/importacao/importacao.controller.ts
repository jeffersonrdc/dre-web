import { Controller, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ImportacaoService } from './importacao.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';


@Controller('importacao')
@UseGuards(AuthGuard('jwt'))
export class ImportacaoController {
    constructor(private readonly importacaoService: ImportacaoService) { }

    @Post('ofx')
    @UseInterceptors(FileInterceptor('file'))
    async importacaoOFX(@UploadedFile() file: Express.Multer.File) {
        return this.importacaoService.importacaoOFX(file);
    }

    @Post('csv')
    @UseInterceptors(FileInterceptor('file'))
    async importacaoCSV(@UploadedFile() file: Express.Multer.File) {
        return this.importacaoService.importacaoCSV(file);
    }
}
