export interface RatingsByMovie {
    id: number;
    rating: number;
    commentary: string | null;
    fromUser: {
        username: string;
        avatarImagePath: string | null;
    };
}
