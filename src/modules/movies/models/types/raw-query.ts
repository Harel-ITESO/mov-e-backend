import { JsonValue } from '@prisma/client/runtime/library';

export interface RawQueryResult {
    id: number;
    tmdb_id: number;
    title: string;
    genres: JsonValue;
    overview: string;
    poster_path: string;
    year: number;
    duration: number;
    ratings_count: number;
    average_ratings: string; // must be parsed
}
