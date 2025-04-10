import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { EnvConfigService } from '../env/env-config.service';
import { TmdbMovieSearch } from './tmdb-movie-search';
import { firstValueFrom } from 'rxjs';
import { TmdbMovieDetail } from './tmdb-movie-detail';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class TmdbService {
    private readonly API_URL = 'https://api.themoviedb.org/3';
    private API_KEY: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly envConfigService: EnvConfigService,
    ) {
        this.API_KEY = this.envConfigService.TMDB_API_KEY;
    }

    /**
     * Return base HttpService axios request options
     * @param extraParams Extra parameters to add to request
     * @returns The Axios request options
     */
    private getBaseHttpOptions(extraParams?: object) {
        return {
            params: {
                api_key: this.API_KEY,
                language: 'en-US',
                ...extraParams,
            },
            headers: {
                Authorization: `Bearer ${this.API_KEY}`,
            },
        } as AxiosRequestConfig;
    }

    /**
     * Returns a list of movies by its title in a usable format
     * @param title The title of the movies to look after
     * @returns The list of movies
     */
    public async searchMoviesByTitle(title: string) {
        const apiUrl = `${this.API_URL}/search/movie`;
        const options = this.getBaseHttpOptions({ query: title });
        const response = await firstValueFrom(
            this.httpService.get<{ results: TmdbMovieSearch[] }>(
                apiUrl,
                options,
            ),
        );
        return response.data.results || null;
    }

    /**
     * Returns the detail of a movie by its id
     * @param movieId
     * @returns The detail of the movie if found
     */
    public async getMovieDetailById(movieId: number) {
        const apiUrl = `${this.API_URL}/movie/${movieId}`;
        const options = this.getBaseHttpOptions();
        const response = await firstValueFrom(
            this.httpService.get<TmdbMovieDetail>(apiUrl, options),
        );
        return response.data || null;
    }

    /**
     * Gets all the popular movies right now
     * @returns All the popular movies
     */
    public async getPopularMovies() {
        const apiUrl = `${this.API_URL}/movie/popular`;
        const options = this.getBaseHttpOptions();
        const response = await firstValueFrom(
            this.httpService.get<TmdbMovieSearch>(apiUrl, options),
        );
        return response.data;
    }
}
