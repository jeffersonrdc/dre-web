import { Controller, Post, UseGuards, Req, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response } from 'express';
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    @HttpCode(HttpStatus.OK)
    /* async login(@Req() req: any) {
        return await this.authService.login(req.user);
    } */
    async login(@Req() req, @Res({ passthrough: true }) response: Response) {

        return this.authService.login(req.user, response);

    }
}
