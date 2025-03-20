import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

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

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.API_KEY = this.configService.get('TMDB_API_KEY') || '';
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
