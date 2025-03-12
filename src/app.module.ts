import { Module } from '@nestjs/common';
import { PrismaService } from './services/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MoviesModule } from './modules/movies/movies.module';

// dynamically import ServeStatic Module if the enviroment is development
function importStaticModuleIfDevEnv() {
    if (process.env.NODE_ENV !== 'development') return [];
    return [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
        }),
    ];
}

@Module({
    imports: [
        ...importStaticModuleIfDevEnv(),
        ConfigModule.forRoot({ isGlobal: true }),
        MoviesModule,
    ],
    controllers: [],
    providers: [PrismaService],
})
export class AppModule {}
