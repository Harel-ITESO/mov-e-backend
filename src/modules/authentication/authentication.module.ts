import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { AuthenticationController } from './authentication.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { SessionsModule } from '../sessions/sessions.module';
import { PassportModule } from '@nestjs/passport';
import { EnvConfigService } from 'src/services/env/env-config.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailVerificationModule } from '../email-verification/email-verification.module';

@Module({
    imports: [
        SessionsModule,
        PassportModule.register({ session: true }),
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: {
                expiresIn: '10m', // lasts only 10 minutes
            },
        }),
        UserModule,
        EmailVerificationModule,
    ],
    controllers: [AuthenticationController],
    providers: [
        AuthenticationService,
        LocalStrategy,
        JwtStrategy,
        EnvConfigService,
    ],
})
export class AuthenticationModule {}
