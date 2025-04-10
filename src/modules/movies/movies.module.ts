import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { HttpModule } from '@nestjs/axios'; // Import HttpModule
import { EnvConfigService } from 'src/services/env/env-config.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { TmdbService } from 'src/services/tmdb/tmdb.service';

@Module({
    imports: [HttpModule], // Ensure HttpModule is imported here
    controllers: [MoviesController],
    providers: [MoviesService, EnvConfigService, PrismaService, TmdbService],
    exports: [MoviesService],
})
export class MoviesModule {}
