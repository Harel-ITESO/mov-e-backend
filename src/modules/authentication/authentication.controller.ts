import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { RegisterUserDto } from './model/dto/register-user.dto';

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
}
