import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EnvConfigService } from 'src/services/env/env-config.service';

type TmdbApiResponse = {
    id: number;
    poster_path: string;
    original_title: string;
    release_date: string;
};

@Injectable()
export class MoviesService {
    private API_URL = 'https://api.themoviedb.org/3';
    private API_KEY: string;

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
            this.httpService.get<{
                results: TmdbApiResponse[];
            }>(`${this.API_URL}/search/movie`, {
                params: {
                    api_key: this.API_KEY,
                    query: title,
                    language: 'es-ES',
                },
                headers: {
                    Authorization: `Bearer ${this.API_KEY}`,
                },
            }),
        );

        return response.data.results.map((movie) => {
            return {
                id: movie.id,
                posterPath:
                    'https://image.tmdb.org/t/p/original' + movie.poster_path,
                title: movie.original_title,
                releaseDate: movie.release_date,
            };
        });
    }
}
