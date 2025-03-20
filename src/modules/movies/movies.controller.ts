import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';

@Controller('movies')
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    // v1/api/authentication/search/:title
    @UseGuards(SessionAuthGuard)
    @Get('search/:title')
    async searchMovies(@Param('title') title: string) {
        return this.moviesService.searchMoviesByTitle(title);
    }
}
