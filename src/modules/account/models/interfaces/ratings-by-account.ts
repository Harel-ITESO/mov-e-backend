export interface RatingsByAccount {
    rating: number;
    commentary: string;
    toMovie: {
        tmdbId: number;
        posterPath: string;
        title: string;
    };
}
