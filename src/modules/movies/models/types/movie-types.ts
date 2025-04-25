import { Prisma, Movie } from '@prisma/client';

export type ApiMovieOverview = Omit<
    Movie,
    'tmdbId' | 'genres' | 'overview' | 'duration'
>;

export type ApiMovieDetail = Omit<Movie, 'id'>;

export type MovieDetailWithRatingsCount = Prisma.MovieGetPayload<{
    include: {
        _count: {
            select: {
                ratings: true;
            };
        };
    };
}>;

export type MovieDetailWithRatings = Prisma.MovieGetPayload<{
    include: {
        ratings: true;
    };
}>;
