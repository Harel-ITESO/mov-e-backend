import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { HttpModule } from '@nestjs/axios';
import { EnvConfigService } from 'src/services/env-config.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UserService } from '../user/user.service';

@Module({
    imports: [HttpModule],
    controllers: [MoviesController],
    providers: [
        MoviesService,
        EnvConfigService,
        PrismaService,
        UserService,
    ],
})
export class MoviesModule {}
