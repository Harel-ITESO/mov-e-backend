import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/services/prisma/prisma.service';
import { TmdbService } from 'src/services/tmdb/tmdb.service';
import { MovieParser } from './movie-parser';
import { CreateMovieDto } from './models/dto/create-movie.dto';
import { ApiMovieDetail } from './models/types/movie-types';

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
     * Tries to find movie from local database
     * @param tmdbId
     * @returns
     */
    public async findMovieOnLocalDatabase(tmdbId: number) {
        return await this.prismaService.movie.findFirst({
            where: { tmdbId },
        });
    }

    /**
     * Tries to find the movie from the external TMDB Api
     * @param tmdbId
     * @returns
     */
    public async findMovieOnApi(tmdbId: number) {
        return MovieParser.parseFromTmdb(
            'detail',
            await this.tmdbService.getMovieDetailById(tmdbId),
        ) as ApiMovieDetail;
    }

    /**
     * Gets the detail of a movie from local or tmdb if not found
     * @param tmdbId The id of the tmdb database
     * @returns The detail of the movie
     */
    public async getMovieDetail(tmdbId: number) {
        try {
            const fromDatabase = await this.findMovieOnLocalDatabase(tmdbId);
            if (fromDatabase) {
                const { tmdbId, ...rest } = fromDatabase;
                rest.id = tmdbId;
                return rest;
            }
            const fromApi = await this.findMovieOnApi(tmdbId);
            return fromApi;
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
