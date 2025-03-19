import {
    BadRequestException,
    Body,
    Controller,
    NotFoundException,
    Post,
    Put,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { RegisterUserDto } from './model/dto/register-user.dto';
import { LoginUserDto } from './model/dto/login-user.dto';
import { DYNAMODB_TABLES, DynamoDbService } from 'src/services/dynamodb.service';
import { EmailService } from 'src/services/email.service';
import { createOneTimePassword, OTP_TYPES } from 'src/util/otp';
import { registerEmailBody, registerEmailSubject } from 'src/util/register-email';
import { OneTimePassword } from 'src/types/otp';
import { ValidateEmailDto } from './model/dto/validate-email.dto';
import { User } from '@prisma/client';
import { CreateOtpDto } from './model/dto/create-otp';

// v1/api/authentication
@Controller('authentication')
export class AuthenticationController {
    private readonly REGISTER_OTP_LENGTH = 6;
    private readonly REGISTER_OTP_LIFETIME_MINUTES = 10;

    constructor(
        private readonly authenticationService: AuthenticationService,
        private readonly dynamoDbService: DynamoDbService,
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
    public async login(@Body() { emailOrUsername, password }: LoginUserDto) {
        try {
            await this.authenticationService.login(emailOrUsername, password);
            return { token: 'jwt token' }; // TODO: Implement JWT functionality
        } catch (e: any) {
            if (e instanceof Error)
                throw new NotFoundException(
                    'Invalid email, username or password',
                );
        }
    }

    // v1/api/authentication/create-otp
    @Post('create-otp')
    public async createOtp(@Body() { email }: CreateOtpDto) {
        await this.authenticationService.getUser(email);
        const otp = createOneTimePassword(this.REGISTER_OTP_LENGTH, OTP_TYPES.NUMERIC);
        const expiration = (Date.now() + this.REGISTER_OTP_LIFETIME_MINUTES*60*1000).toString();
        const otpRegister: OneTimePassword = {
            email: { S: email },
            opt: { S: otp },
            expiration: { N: expiration }
        };
        await this.dynamoDbService.putOne(DYNAMODB_TABLES.OTP, otpRegister);
        await this.emailService.sendEmail(
            email,
            registerEmailSubject(),
            registerEmailBody(otp)
        );
    }

    // v1/api/authentication/validate-email
    @Put('validate-email')
    public async validateEmail(@Body() { email, otp }: ValidateEmailDto) {
        const user = await this.authenticationService.getUser(email) as User;
        const otpQuery: OneTimePassword = {
            email: { S: email }
        };
        const output = await this.dynamoDbService.findOneOrThrow(DYNAMODB_TABLES.OTP, otpQuery, 'Email not found');
        await this.dynamoDbService.deleteOne(DYNAMODB_TABLES.OTP, otpQuery);
        const otpRegister = output.Item as OneTimePassword;
        const currentTime = Date.now();
        const expirationTime = parseInt(otpRegister.expiration!.N);
        if (otpRegister.opt?.S != otp || currentTime > expirationTime) {
            throw new UnauthorizedException('Invalid one time password');
        }
        await this.authenticationService.updateValidEmail(user);
    }
}
