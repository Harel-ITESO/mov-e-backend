import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private readonly authenticationService: AuthenticationService) {
        super({
            usernameField: 'emailOrUsername',
            passwordField: 'password',
        });
    }

    async validate(emailOrUsername: string, password: string) {
        const user = await this.authenticationService.verifyLoginData(
            emailOrUsername,
            password,
        );
        if (!user)
            throw new UnauthorizedException(
                'Invalid email, username or password',
            );
        return user;
    }
}
