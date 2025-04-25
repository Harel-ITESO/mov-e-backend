export interface RatingDetail {
    rating: number;
    commentary: string | null;
    fromUser: {
        id: number;
        avatarImagePath: string | null;
        username: string;
    };
    toMovie: {
        title: string;
        tmdbId: number;
        posterPath: string;
    };
    likesCount: number;
    likeFromCurrentUser: boolean;
}
