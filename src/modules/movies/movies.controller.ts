import {
    Controller,
    Get,
    NotFoundException,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@Controller('movies')
@UseGuards(SessionAuthGuard)
@UseInterceptors(CacheInterceptor)
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    // v1/api/movies/search/:title
    @Get('search/:title')
    public async searchMovies(@Param('title') title: string) {
        return await this.moviesService.searchMoviesByTitle(title);
    }

    // v1/api/movies/movie/detail/:id
    @Get('movie/:id/detail')
    @CacheTTL(300000) // cache it just for 5 minutes
    public async getMovieDetailById(
        @Param('id') id: number,
        @Query('ratings_info') ratingsInfo?: boolean,
    ) {
        const detail = await this.moviesService.getMovieDetail(
            id,
            ratingsInfo || false,
        );
        if (!detail) throw new NotFoundException('Movie not found');
        return detail;
    }

    // v1/api/movies/popular
    @Get('popular')
    public async getPopularMovies() {
        return await this.moviesService.getAllPopularMovies();
    }
}
