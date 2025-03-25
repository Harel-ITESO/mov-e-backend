import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { MoviesModule } from './modules/movies/movies.module';
import { DynamoService } from './services/aws/dynamo/dynamo.service';
import { SessionModule } from './modules/session/session.module';
import { EnvConfigService } from './services/env-config.service';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        UserModule,
        AuthenticationModule,
        MoviesModule,
        SessionModule,
    ],
    controllers: [],
    providers: [PrismaService, DynamoService, EnvConfigService],
})
export class AppModule {}
