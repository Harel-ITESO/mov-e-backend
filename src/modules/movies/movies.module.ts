import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { HttpModule } from '@nestjs/axios';
import { EnvConfigService } from 'src/services/env-config.service';

@Module({
    imports: [HttpModule],
    controllers: [MoviesController],
    providers: [MoviesService, EnvConfigService],
})
export class MoviesModule {}
