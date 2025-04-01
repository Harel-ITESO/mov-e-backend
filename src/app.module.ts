import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { MoviesModule } from './modules/movies/movies.module';
import { DynamoService } from './services/aws/dynamo/dynamo.service';
import { SessionsModule } from './modules/sessions/sessions.module';
import { EnvConfigService } from './services/env/env-config.service';
import { SesService } from './services/aws/ses/ses.service';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { S3Service } from './services/aws/s3/s3.service';
import { AccountModule } from './modules/account/account.module';
import { FilesModule } from './modules/files/files.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        UserModule,
        AuthenticationModule,
        MoviesModule,
        SessionsModule,
        EmailVerificationModule,
        AccountModule,
        FilesModule,
    ],
    controllers: [],
    providers: [PrismaService, DynamoService, EnvConfigService, SesService, S3Service],
})
export class AppModule {}
