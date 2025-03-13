import {
    BadRequestException,
    Body,
    Controller,
    NotFoundException,
    Post,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { RegisterUserDto } from './model/dto/register-user.dto';
import { LoginUserDto } from './model/dto/login-user.dto';

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
}
