import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { EnvConfigService } from 'src/services/env/env-config.service';
import { TMDB_Movie } from 'src/types/tmdb-movie';
import { Movie } from '@prisma/client';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/services/prisma/prisma.service';

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
        private readonly envConfigService: EnvConfigService,
        private readonly prismaService: PrismaService,
        private readonly userService: UserService,
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

    /**
     * Looks for a movie in TMDB
     * @param movieId The movie id
     * @returns The movie if found, otherwise `null`
     */
    async tmdbGetMovie(movieId: number): Promise<TMDB_Movie | null> {
        try {
            const response = await firstValueFrom(
                this.httpService.get<TMDB_Movie>(
                    `${this.API_URL}/movie/${movieId}`,
                    {
                        params: {
                            api_key: this.API_KEY,
                            language: 'es-ES',
                        },
                        headers: {
                            Authorization: `Bearer ${this.API_KEY}`,
                        },
                    },
                ),
            );
            return response.data;
        } catch {
            return null;
        }
    }

    /**
     * Looks for a movie in the local database
     * @param movieId The movie id
     * @returns The movie if found, otherwise `null`
     */
    async localGetMovie(movieId: number): Promise<Movie | null> {
        const movie = await this.prismaService.movie.findFirst({
            where: { tmdbId: movieId, }
        });
        return movie;
    }

    /**
     * Copies the movie from TMDB to the local database
     * @param movie The movie with TMDB format
     * @returns The movie created
     */
    async copyMovieFromTmdbToLocal(movie: TMDB_Movie): Promise<Movie> {
        const genres = JSON.stringify(
            movie.genres.map(genre => genre.name)
        );
        const year = new Date(movie.release_date).getFullYear();
        return this.prismaService.movie.create({
            data: {
                tmdbId: movie.id,
                title: movie.title,
                genres,
                overview: movie.overview,
                posterPath: movie.poster_path,
                year,
                duration: movie.runtime,
            }
        });
    }

    /**
     * Looks for a movie in local database, if found, it's returned.
     * If not, looks for the movie in TMDB, if found, return it.
     * If not, returns `null`.
     * @param movieId The movie id
     * @returns The movie if found, otherwise `null`
     */
    async getMovie(movieId: number): Promise<MovieFound | null> {
        const movie = await this.localGetMovie(movieId);
        if (movie) {
            return { isLocalMovie: true, movie, };
        }
        const movieTMDB = await this.tmdbGetMovie(movieId);
        if (movieTMDB) {
            return { isLocalMovie: false, movie: movieTMDB, };
        }
        return null;
    }
    
    /**
     * Looks for a movie in local database, if found, it's returned.
     * If not, looks for the movie in TMDB, if found, create that register in local database and return it.
     * If not, returns `null`.
     * @param movieId The movie id
     * @returns The movie if found, otherwise `null`
     */
    async createMovie(movieId: number): Promise<Movie | null> {
        const movieFound = await this.getMovie(movieId);
        if (!movieFound) {
            return null;
        }
        const { isLocalMovie, movie, } = movieFound;
        if (isLocalMovie) {
            return movie as Movie;
        }
        const movieCreated = await this.copyMovieFromTmdbToLocal(movie as TMDB_Movie);
        return movieCreated;
    }

    /**
     * Retrieves all the ratings a movie has
     * @param userId The user id
     * @param movieId The movie id
     * @returns The ratings found
     */
    async getRatings(userId: number, movieId: number) {
        const ratings = await this.prismaService.rating.findMany({
            where: { movieId, },
            include: { fromUser: true, },
        });
        let ratingSum = 0;
        const ratingsFiltered = await Promise.all(
            ratings.map(async rating => {
                const likes = await this.prismaService.ratingLike.count({
                    where: { ratingId: rating.id, },
                });
                const myLike = await this.prismaService.ratingLike.findUnique({
                    where: {
                        userId_ratingId: {
                            ratingId: rating.id,
                            userId,
                        },
                    },
                });
                const hasMyLike = !!myLike;
                const user = this.userService.filterPasswordFromUser(rating.fromUser);
                ratingSum += rating.rating.toNumber();
                return {
                    rating: {
                        id: rating.id,
                        rating: rating.rating.toNumber(),
                        commentary: rating.commentary,
                        likes,
                        hasMyLike,
                    },
                    user,
                };
            })
        );
        const averageRating = ratingsFiltered.length > 0
            ? ratingSum / ratingsFiltered.length : null;
        return { ratings: ratingsFiltered, averageRating };
    }
}

interface MovieFound {
    isLocalMovie: boolean;
    movie: Movie | TMDB_Movie;
}
