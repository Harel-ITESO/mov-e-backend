import { Controller, Get, NotFoundException, Param, ParseIntPipe, Req, UseGuards } from '@nestjs/common';
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
    public async createRating(
        @Req() request: Request,
        @Param('movieId', ParseIntPipe) movieId: number,
    ) {
        const user = request.user as User;
        const movieFound = await this.moviesService.getMovie(movieId);
        if (!movieFound) {
            throw new NotFoundException('Movie not found');
        }
        const { isLocalMovie, movie, } = movieFound;
        if (!isLocalMovie) {
            return { ratings: [] };
        }
        return this.moviesService.getRatings(user.id, movie.id);
    }
}
