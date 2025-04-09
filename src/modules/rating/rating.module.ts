import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { HttpModule } from '@nestjs/axios';
import { EnvConfigService } from 'src/services/env/env-config.service';
import { MoviesModule } from '../movies/movies.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [HttpModule, MoviesModule, UserModule],
    controllers: [RatingController],
    providers: [RatingService, PrismaService, EnvConfigService],
})
export class RatingModule {}
