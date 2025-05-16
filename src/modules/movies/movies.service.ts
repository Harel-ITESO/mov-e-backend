import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/services/prisma/prisma.service';
import { TmdbService } from 'src/services/tmdb/tmdb.service';
import { MovieParser } from './movie-parser';
import { CreateMovieDto } from './models/dto/create-movie.dto';
import { ApiMovieDetail } from './models/types/movie-types';
import { RawQueryResult } from './models/types/raw-query';

@Injectable()
export class MoviesService {
    private readonly logger = new Logger(MoviesService.name);
    constructor(
        private readonly prismaService: PrismaService,
        private readonly tmdbService: TmdbService,
    ) {}

    /**
     * Searches movies by title in TMDb API
     * @param title Title of the movie
     * @returns An Array of the movies found
     */
    public async searchMoviesByTitle(title: string) {
        const data = await this.tmdbService.searchMoviesByTitle(title);
        return data.map((e) => MovieParser.parseFromTmdb('search', e));
    }

    /**
     * Gets all popular movies
     * @returns The popular movies
     */
    public async getAllPopularMovies() {
        const data = await this.tmdbService.getPopularMovies();
        return data.map((movie) => MovieParser.parseFromTmdb('search', movie));
    }

    /**
     * Tries to find movie from local database
     * @param tmdbId
     * @returns
     */
    public async findMovieOnLocalDatabase(
        tmdbId: number,
        withRatingsInfo: boolean,
    ) {
        if (!withRatingsInfo) {
            return await this.prismaService.movie.findUnique({
                where: { tmdbId },
            });
        }
        const rows: RawQueryResult[] = await this.prismaService.$queryRaw`
            SELECT m.id, tmdb_id, title, genres, overview, poster_path, year, duration, count(rating)::int as "ratings_count", avg(rating) as "average_ratings" 
            FROM movie m 
            LEFT JOIN rating r ON r.movie_id = m.id
            WHERE m.tmdb_id = ${tmdbId}
            GROUP BY m.id, tmdb_id, title, genres, overview, poster_path, year, duration
            `;
        const result = rows[0];
        if (!result) return null;
        return MovieParser.parseFromRawQueryResult(result);
    }

    /**
     * Tries to find the movie from the external TMDB Api
     * @param tmdbId
     * @returns
     */
    public async findMovieOnApi(tmdbId: number) {
        const movie = await this.tmdbService.getMovieDetailById(tmdbId);
        if (!movie) return null;
        const parsedMovie = MovieParser.parseFromTmdb(
            'detail',
            await this.tmdbService.getMovieDetailById(tmdbId),
        ) as ApiMovieDetail;
        return parsedMovie;
    }

    /**
     * Gets the detail of a movie from local or tmdb if not found
     * @param tmdbId The id of the tmdb database
     * @returns The detail of the movie
     */
    public async getMovieDetail(tmdbId: number, withRatingsInfo: boolean) {
        try {
            const fromDatabase = await this.findMovieOnLocalDatabase(
                tmdbId,
                withRatingsInfo,
            );
            if (fromDatabase) {
                return MovieParser.parseFromDatabase(fromDatabase);
            }
            const fromApi = await this.findMovieOnApi(tmdbId);
            return { ...fromApi, averageRatings: 0, ratingsCount: 0 };
        } catch (e) {
            this.logger.error(e);
            return null;
        }
    }

    /**
     * Creates a movie to the database (This should only be accesible by an external handler)
     * @param data The data to add
     * @returns The created movie
     */
    public async addMovieToDatabase(data: CreateMovieDto) {
        const result = await this.prismaService.movie.create({
            data,
        });
        return result;
    }
}
