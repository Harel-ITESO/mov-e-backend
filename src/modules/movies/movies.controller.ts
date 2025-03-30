import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { Request } from 'express';
import { User } from '@prisma/client';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    // v1/api/movies/search/:title
    @UseGuards(SessionAuthGuard)
    @Get('search/:title')
    async searchMovies(@Param('title') title: string) {
        return this.moviesService.searchMoviesByTitle(title);
    }

    // v1/api/movies/:movieId/ratings
    @Get(':movieId/ratings')
    @UseGuards(SessionAuthGuard)
    public createRating(
        @Req() request: Request,
        @Param('movieId') movieId: string,
    ) {
        const user = request.user as User;
        return this.moviesService.getRatings(user.id, movieId);
    }
}
