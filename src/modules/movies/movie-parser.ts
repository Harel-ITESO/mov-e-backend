import { TmdbMovieDetail } from 'src/services/tmdb/tmdb-movie-detail';
import { TmdbMovieSearch } from 'src/services/tmdb/tmdb-movie-search';
import { ApiMovieDetail, ApiMovieOverview } from './models/types/movie-types';
import { JsonValue } from '@prisma/client/runtime/library';
import { Movie } from '@prisma/client';

export abstract class MovieParser {
    /**
     * Parse to detail
     * @param data
     * @returns
     */
    private static detailParser(data: TmdbMovieDetail) {
        const {
            original_title,
            poster_path,
            release_date,
            id,
            runtime,
            overview,
            genres,
        } = data;
        const year = new Date(release_date).getFullYear();
        const parsed = {
            tmdbId: id,
            title: original_title,
            posterPath: `https://image.tmdb.org/t/p/original/${poster_path}`,
            duration: runtime,
            overview,
            year,
            genres: genres as unknown as JsonValue,
        } as ApiMovieDetail;
        return parsed;
    }

    /**
     * Parse to search
     * @param data
     * @returns
     */
    public static searchParser(data: TmdbMovieSearch) {
        const { id, original_title, poster_path, release_date } = data;
        const year = new Date(release_date).getFullYear();
        const parsed = {
            id,
            title: original_title,
            posterPath: `https://image.tmdb.org/t/p/original/${poster_path}`,
            year,
        } as ApiMovieOverview;
        return parsed;
    }

    /**
     * Parsing handler
     * @param mode
     * @param movieData
     * @returns
     */
    public static parseFromTmdb(
        mode: 'detail' | 'search',
        movieData: TmdbMovieDetail | TmdbMovieSearch,
    ): ApiMovieDetail | ApiMovieOverview {
        switch (mode) {
            case 'detail':
                return this.detailParser(movieData as TmdbMovieDetail);
            case 'search':
                return this.searchParser(movieData as TmdbMovieSearch);
        }
    }

    /**
     * Parsing handler for normalizing db data
     * @param movieData
     * @returns Parsed data
     */
    public static parseFromDatabase(movieData: Movie): ApiMovieDetail {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = movieData;
        return rest;
    }
}
