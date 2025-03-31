import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { MoviesService } from '../movies/movies.service';
import { HttpModule } from '@nestjs/axios';
import { EnvConfigService } from 'src/services/env/env-config.service';

@Module({
  imports: [HttpModule],
  controllers: [RatingController],
  providers: [
    RatingService,
    PrismaService,
    UserService,
    MoviesService,
    EnvConfigService,
  ],
})
export class RatingModule {}
