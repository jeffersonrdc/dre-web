import { Controller, Post, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
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

    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Req() req, @Res({ passthrough: true }) response: Response) {

        return this.authService.refreshToken(req, response);

    }
}
