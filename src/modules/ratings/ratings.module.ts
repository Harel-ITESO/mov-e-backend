import { Module } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { EnvConfigService } from 'src/services/env/env-config.service';
import { MoviesModule } from '../movies/movies.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [HttpModule, MoviesModule, UserModule],
    controllers: [RatingsController],
    providers: [RatingsService, PrismaService, EnvConfigService],
})
export class RatingsModule {}
