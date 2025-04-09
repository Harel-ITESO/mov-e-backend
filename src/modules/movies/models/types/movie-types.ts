import { Movie } from '@prisma/client';

export type ApiMovieOverview = Omit<
    Movie,
    'tmdbId' | 'genres' | 'overview' | 'duration'
>;

export type ApiMovieDetail = Omit<Movie, 'id'>;
