import { PassportStrategy } from "@nestjs/passport";
import { Strategy, StrategyOptionsWithRequest } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";


export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        } as StrategyOptionsWithRequest);
    }

    async validate(payload: any) {
        return { ID_Usuario: payload.sub };
    }
}