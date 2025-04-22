import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    NotFoundException,
    Param,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
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
    @Post('register/email/verification/:verificationId')
    public async processEmailVerification(
        @Param('verificationId') verificationId: string,
    ) {
        try {
            return await this.authenticationService.processPendingEmailVerification(
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
    public login() {
        return { message: "You're logged in" };
    }

    // v1/api/authentication/logout
    @Delete('logout')
    @UseGuards(SessionAuthGuard)
    public logout(
        @Req() request: Request,
        @Res({ passthrough: true }) response: Response,
    ) {
        response.clearCookie('connect.sid'); // remove cookie
        request.session.destroy((err) => {
            if (err) throw new BadRequestException('Unable to logout');
        });
        return { message: 'Successfully logged out' };
    }
}
