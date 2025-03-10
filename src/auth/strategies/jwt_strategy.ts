import { PassportStrategy } from "@nestjs/passport";
import { Strategy, StrategyOptionsWithRequest } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import { Request } from 'express';
import { Injectable } from '@nestjs/common';
import { JwtPayload } from "../interfaces/jwt-payload.interface";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    return request?.cookies?.jwt;
                }
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
            passReqToCallback: true,
        } as StrategyOptionsWithRequest);
    }

    async validate(request: Request, payload: JwtPayload) {
        return { ID_Usuario: payload.sub };
    }
}