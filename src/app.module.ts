import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MoviesModule } from './modules/movies/movies.module';
import { NODE_ENV } from './util/globals';

// dynamically import ServeStatic Module if the enviroment is development
function importStaticModuleIfDevEnv() {
    if (NODE_ENV !== 'development') return [];
    return [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
        }),
    ];
}

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        UserModule,
        AuthenticationModule,
        MoviesModule,
    ],
    controllers: [],
    providers: [PrismaService],
})
export class AppModule {}
