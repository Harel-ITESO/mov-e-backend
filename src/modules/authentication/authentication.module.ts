import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionModule } from '../session/session.module';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [SessionModule, PassportModule.register({ session: true })],
    controllers: [AuthenticationController],
    providers: [
        AuthenticationService,
        UserService,
        PrismaService,
        LocalStrategy,
    ],
})
export class AuthenticationModule {}
