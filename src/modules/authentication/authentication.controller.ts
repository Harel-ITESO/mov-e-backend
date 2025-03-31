import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { UserWithoutPassword } from '../user/model/types/user-without-password';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { JwtGuard } from './guards/jwt.guard';
import { SignupWithoutEmailDto } from './models/dto/signup-without-email.dto';
import { JwtPayload } from './models/types/jwt-payload';
import { RegisterEmailDto } from './models/dto/register-email.dto';
import { EmailVerificationExpiredException } from '../email-verification/models/email-verification-expired.exception';

// v1/api/authentication
@Controller('authentication')
export class AuthenticationController {
    constructor(
        private readonly authenticationService: AuthenticationService,
    ) {}

    // v1/api/authentication/register/email
    @Post('register/email')
    public async registerEmail(@Body() data: RegisterEmailDto) {
        try {
            return await this.authenticationService.registerEmailForVerification(
                data.email,
            );
        } catch (e) {
            if (e instanceof Error) throw new BadRequestException(e.message);
        }
    }

    // v1/api/authentication/register/verification/:verificationId
    @Get('register/email/verification/:verificationId')
    public async verifyEmail(@Param('verificationId') verificationId: string) {
        try {
            return await this.authenticationService.verifyEmailRegistered(
                verificationId,
            );
        } catch (e) {
            if (e instanceof EmailVerificationExpiredException)
                // TODO: Implement resending of verification (Possibly)
                throw new BadRequestException('Email verification had expired');
            if (e instanceof Error)
                throw new NotFoundException(
                    'Email pending verification was not found',
                );
        }
    }

    // v1/api/authentication/register/signup
    @Post('register/signup')
    @UseGuards(JwtGuard) // Can't enter here if there's no JWT provided by the email validation
    public async signup(
        @Body() data: SignupWithoutEmailDto,
        @Req() request: Request,
    ) {
        if (data.password !== data.repeatedPassword)
            throw new BadRequestException('Passwords do not match');
        const email = (request.user as JwtPayload).email;
        const userRegistered = await this.authenticationService.signUp({
            ...data,
            email,
        });
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
    @Delete('logout')
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
