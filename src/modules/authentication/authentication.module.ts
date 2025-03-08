import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UserService } from '../user/user.service';

@Module({
    controllers: [AuthenticationController],
    providers: [AuthenticationService, UserService],
})
export class AuthenticationModule {}
