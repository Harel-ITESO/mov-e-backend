import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
<<<<<<< HEAD
import { EnvConfigService } from 'src/services/env-config.service';

type TmdbMovie = {
    id: number;
    poster_path: string;
    original_title: string;
    release_date: string;
};

@Injectable()
export class MoviesService {
    private API_URL = 'https://api.themoviedb.org/3';
    private API_KEY: string;
=======
import { Movie } from '@prisma/client';
import { TMDB_API_KEY } from 'src/util/globals';

@Injectable()
export class MoviesService {
  // URL base para consultas a TMDb
  private API_URL = 'https://api.themoviedb.org/3';
  // Clave de API de TMDb almacenada en variables de entorno
  private API_KEY = TMDB_API_KEY;
>>>>>>> 0abafb2072e58d5657007950e927b2f6494c207f

    constructor(
        private readonly httpService: HttpService,
        private readonly envConfigService: EnvConfigService,
    ) {
        this.API_KEY = this.envConfigService.TMDB_API_KEY;
    }

    /**
     * Searches movies by title in TMDb API
     * @param title Title of the movie
     * @returns An Array of the movies found
     */
    async searchMoviesByTitle(title: string) {
        const response = await firstValueFrom(
            this.httpService.get<{ results: TmdbMovie[] }>(
                `${this.API_URL}/search/movie`,
                {
                    params: {
                        api_key: this.API_KEY,
                        query: title,
                        language: 'es-ES',
                    },
                    headers: {
                        Authorization: `Bearer ${this.API_KEY}`,
                    },
                },
            ),
        );

        return response.data.results.map((movie) => {
            return {
                id: movie.id,
                posterPath: movie.poster_path,
                title: movie.original_title,
                releaseDate: movie.release_date,
            };
        });
    }
}
