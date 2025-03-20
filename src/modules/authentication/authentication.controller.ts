import {
    BadRequestException,
    Body,
    Controller,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { RegisterUserDto } from './model/dto/register-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { UserWithoutPassword } from '../user/model/types/user-without-password';
import { SessionAuthGuard } from './guards/session-auth.guard';

// v1/api/authentication
@Controller('authentication')
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
    ) {}

    // v1/api/authentication/register
    @Post('register')
    public async register(@Body() data: RegisterUserDto) {
        if (data.password !== data.repeatedPassword)
            throw new BadRequestException('Passwords do not match');
        const userRegistered = await this.authenticationService.register(data);
        return userRegistered;
    }

    // v1/api/authentication/login
    @Post('login')
    @UseGuards(LocalAuthGuard)
    public async login(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        const user = request.user as UserWithoutPassword;
        const session = await this.authenticationService.generateSession(
            user.id,
        );
        const { sessionId, expiresAt } = session;
        response.cookie('sessionId', sessionId, {
            expires: new Date(expiresAt),
            httpOnly: true,
            signed: true,
        });
        return { message: "You're logged in" };
    }

    // v1/api/authentication/logout
    @Post('logout')
    @UseGuards(SessionAuthGuard)
    public async logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        const sessionId = request.signedCookies['sessionId'] as string;
        if (!sessionId)
            throw new UnauthorizedException('You are not logged in');
        await this.authenticationService.logoutFromSession(sessionId);
        response.clearCookie('sessionId');
        return { message: 'Successfully logged out' };
    }
}
