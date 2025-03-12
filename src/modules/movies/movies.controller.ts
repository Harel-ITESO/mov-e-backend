import { Controller,Get, Param } from '@nestjs/common';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('search/:title')
  async searchMovies(@Param('title') title: string) {
    return this.moviesService.searchMoviesByTitle(title);
  }
}
