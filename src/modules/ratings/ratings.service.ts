import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { MoviesService } from '../movies/movies.service';
import { CreateRatingDto } from './model/dto/create-rating.dto';
import { Movie } from '@prisma/client';

@Injectable()
export class RatingsService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly moviesService: MoviesService,
    ) {}

    /**
     * Retrieves a rating by its id
     * @param ratingId The rating id
     * @returns The rating if found, otherwise `null`
     */
    public async getRatingById(ratingId: number, withMovie?: boolean) {
        return await this.prismaService.rating.findUniqueOrThrow({
            include: {
                toMovie: withMovie,
            },
            where: {
                id: ratingId,
            },
        });
    }

    /**
     * Creates a rating
     * @param userId The user id
     * @param movieId The movie id
     * @param rating The rating value
     * @param commentary The commentary
     * @returns The rating created
     */
    public async createRating(userId: number, data: CreateRatingDto) {
        const movieInDatabase =
            await this.moviesService.findMovieOnLocalDatabase(data.tmdbId);
        let movieConnect: Movie | null;

        if (!movieInDatabase) {
            const fromApi = await this.moviesService.findMovieOnApi(
                data.tmdbId,
            );
            if (!fromApi) return null;
            const { genres, ...rest } = fromApi;
            movieConnect = await this.moviesService.addMovieToDatabase({
                ...rest,
                genres: genres as string[],
            });
        } else {
            movieConnect = movieInDatabase;
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tmdbId, ...rest } = data; // remove tmdbId for creation
        return await this.prismaService.rating.create({
            data: {
                ...rest,
                fromUser: {
                    connect: {
                        id: userId,
                    },
                },
                toMovie: {
                    connect: {
                        id: movieConnect.id,
                    },
                },
            },
        });
    }

    /**
     * Deletes a rating
     * @param userId The user id
     * @param ratingId The rating id
     * @returns The rating deleted
     */
    public async deleteRating(userId: number, ratingId: number) {
        return await this.prismaService.rating.delete({
            where: {
                id: ratingId,
                userId,
            },
        });
    }

    /**
     * Retrives a rating like
     * @param userId The user id
     * @param ratingId The rating id
     * @returns The rating like if found, otherwise `null`
     */
    public getRatingLike(userId: number, ratingId: number) {
        return this.prismaService.ratingLike.findUnique({
            where: {
                userId_ratingId: {
                    userId,
                    ratingId,
                },
            },
        });
    }

    /**
     * Creates a rating like
     * @param userId The user id
     * @param ratingId The rating id
     * @returns The rating like created
     */
    public createRatingLike(userId: number, ratingId: number) {
        return this.prismaService.ratingLike.create({
            data: {
                userId,
                ratingId,
            },
        });
    }

    /**
     * Deletes a rating like
     * @param userId The user id
     * @param ratingId The rating id
     * @returns The rating like deleted
     */
    public deleteRatingLike(userId: number, ratingId: number) {
        return this.prismaService.ratingLike.delete({
            where: {
                userId_ratingId: {
                    userId,
                    ratingId,
                },
            },
        });
    }
}
