import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MoviesService {
  private API_URL = 'https://api.themoviedb.org/3';
  private API_KEY = process.env.TMDB_API_KEY ;

  constructor(private readonly httpService: HttpService) {}

  async searchMoviesByTitle(title: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.API_URL}/search/movie`, {
          params: { api_key: this.API_KEY, query: title, language: 'es-ES' },
        }),
      );

      
      return response.data.results.map((movie) => ({
        tmdbId: movie.id,
        title: movie.title,
        genres: movie.genre_ids, 
        overview: movie.overview,
        posterPath: movie.poster_path,
        year: new Date(movie.release_date).getFullYear(),
        duration: movie.runtime || 0, 
      }));
    } catch (error) {
      throw new HttpException(
        'Error al buscar películas en TMDb',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
