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
            /* jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        } as StrategyOptionsWithRequest); */
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

    /* async validate(payload: any) {
        return { ID_Usuario: payload.sub };
    } */
    async validate(request: Request, payload: JwtPayload) {
        return { ID_Usuario: payload.sub };
    }
}