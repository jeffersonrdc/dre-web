import { Controller, Post, UseGuards, Req, Res, HttpCode, HttpStatus, Get } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post()
    @HttpCode(HttpStatus.OK)
    async login(@Req() req, @Res({ passthrough: true }) response: Response) {

        return this.authService.login(req.user, response);

    }

    @Get('atualiza-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Req() req, @Res({ passthrough: true }) response: Response) {

        return this.authService.refreshToken(req, response);

    }

    @Get('verifica-token')
    @HttpCode(HttpStatus.NO_CONTENT)
    async verificaValidadeToken(@Req() req){
        return this.authService.verificaValidadeToken(req);
    }

    @Get('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) response: Response) {

        return this.authService.logout(response);

    }
}
