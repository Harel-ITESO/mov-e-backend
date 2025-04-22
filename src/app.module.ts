import { Module } from '@nestjs/common';
import { APP_GUARD as PROXY_GUARD } from '@nestjs/core';
import { PrismaService } from './services/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { MoviesModule } from './modules/movies/movies.module';
import { DynamoService } from './services/aws/dynamo/dynamo.service';
import { RatingsModule } from './modules/ratings/ratings.module';
import { EnvConfigService } from './services/env/env-config.service';
import { SesService } from './services/aws/ses/ses.service';
import { EmailVerificationModule } from './modules/email-verification/email-verification.module';
import { S3Service } from './services/aws/s3/s3.service';
import { AccountModule } from './modules/account/account.module';
import { FilesModule } from './modules/files/files.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TmdbService } from './services/tmdb/tmdb.service';
import ThrottleBehindProxy from './guards/throttler-behind-proxy.guard';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 3,
                },
                {
                    name: 'medium',
                    ttl: 10000,
                    limit: 20,
                },
                {
                    name: 'long',
                    ttl: 60000,
                    limit: 100,
                },
            ],
        }),
        UserModule,
        AuthenticationModule,
        MoviesModule,
        RatingsModule,
        EmailVerificationModule,
        AccountModule,
        FilesModule,
        HttpModule,
    ],
    controllers: [],
    providers: [
        PrismaService,
        DynamoService,
        EnvConfigService,
        SesService,
        S3Service,
        {
            provide: PROXY_GUARD,
            useClass: ThrottleBehindProxy,
        },
        TmdbService,
    ],
})
export class AppModule {}
