import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../models/types/jwt-payload';
import { InternalServerErrorException } from '@nestjs/common';

export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret)
            throw new InternalServerErrorException('JWT Secret not found');

        super({
            secretOrKey: process.env.JWT_SECRET || '',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }

    public validate(payload: JwtPayload) {
        return payload;
    }
}
