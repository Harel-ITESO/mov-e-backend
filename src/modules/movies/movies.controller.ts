import {
    Controller,
    Get,
    NotFoundException,
    Param,
    UseGuards,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';

@Controller('movies')
@UseGuards(SessionAuthGuard)
export class MoviesController {
    constructor(private readonly moviesService: MoviesService) {}

    // v1/api/movies/search/:title
    @Get('search/:title')
    public async searchMovies(@Param('title') title: string) {
        return await this.moviesService.searchMoviesByTitle(title);
    }

    @Get('movie/detail/:id')
    public async getMovieDetailById(@Param('id') id: number) {
        const detail = await this.moviesService.getMovieDetail(id);
        if (!detail) throw new NotFoundException('Movie not found');
        return detail;
    }
}
