import {
    BadRequestException,
    Body,
    Controller,
    Post,
    Req,
    Res,
    Put,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { RegisterUserDto } from './model/dto/register-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { UserWithoutPassword } from '../user/model/types/user-without-password';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { EmailService } from 'src/services/email.service';
import { createOneTimePassword, OTP_TYPES } from 'src/util/otp';
import { registerEmailBodyHtml, registerEmailBodyText, registerEmailSubject } from 'src/util/register-email';
import { OneTimePassword } from 'src/types/otp';
import { ValidateEmailDto } from './model/dto/validate-email.dto';
import { User } from '@prisma/client';
import { CreateOtpDto } from './model/dto/create-otp';
import { DYNAMO_TABLES, DynamoService } from 'src/services/aws/dynamo/dynamo.service';

// v1/api/authentication
@Controller('authentication')
export class AuthenticationController {
    private readonly REGISTER_OTP_LENGTH = 6;
    private readonly REGISTER_OTP_LIFETIME_MINUTES = 10;

    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly dynamoService: DynamoService,
        private readonly emailService: EmailService
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

    // v1/api/authentication/create-otp
    @Post('create-otp')
    public async createOtp(@Body() { email }: CreateOtpDto) {
        await this.authenticationService.getUser(email);
        const otp = createOneTimePassword(this.REGISTER_OTP_LENGTH, OTP_TYPES.NUMERIC);
        const expiration = (Date.now() + this.REGISTER_OTP_LIFETIME_MINUTES*60*1000).toString();
        const otpRegister: OneTimePassword = {
            email: { S: email },
            otp: { S: otp },
            expiration: { N: expiration }
        };
        await this.dynamoService.putOne(DYNAMO_TABLES.OTP, otpRegister);
        await this.emailService.sendEmail(
            email,
            registerEmailSubject(),
            registerEmailBodyHtml(otp),
            registerEmailBodyText(otp)
        );
    }

    // v1/api/authentication/validate-email
    @Put('validate-email')
    public async validateEmail(@Body() { email, otp }: ValidateEmailDto) {
        const user = await this.authenticationService.getUser(email) as User;
        const otpQuery: OneTimePassword = {
            email: { S: email }
        };
        const output = await this.dynamoService.findOneOrThrow(DYNAMO_TABLES.OTP, otpQuery, 'Email not found');
        await this.dynamoService.deleteOne(DYNAMO_TABLES.OTP, otpQuery);
        const otpRegister = output.Item as OneTimePassword;
        const currentTime = Date.now();
        const expirationTime = parseInt(otpRegister.expiration!.N);
        if (otpRegister.otp?.S != otp || currentTime > expirationTime) {
            throw new UnauthorizedException('Invalid one time password');
        }
        await this.authenticationService.updateValidEmail(user);
    }
}
