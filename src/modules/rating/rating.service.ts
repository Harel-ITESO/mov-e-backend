import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class RatingService {
    constructor(
        private readonly prismaService: PrismaService,
    ) {}

    /**
     * Retrieves a rating by its id
     * @param ratingId The rating id
     * @returns The rating if found, otherwise `null`
     */
    public getRatingById(ratingId: number) {
        return this.prismaService.rating.findUnique({
            where: {
                id: ratingId,
            },
        });
    }

    /**
     * Retrives a rating by its id and the user id
     * @param userId The user id
     * @param ratingId The rating id
     * @returns The rating if found, otherwise `null`
     */
    public getRatingByIdAndUser(userId: number, ratingId: number) {
        return this.prismaService.rating.findUnique({
            where: {
                id: ratingId,
                userId,
            },
        });
    }

    /**
     * Retrieves a rating by the user id and movie id
     * @param userId The user id
     * @param movieId The movie id
     * @returns The rating if found, otherwise `null`
     */
    public getRatingByUserAndMovie(userId: number, movieId: number) {
        return this.prismaService.rating.findUnique({
            where: {
                userId_movieId: {
                    userId,
                    movieId,
                },
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
    public createRating(userId: number, movieId: number, rating: number, commentary: string | undefined) {
        return this.prismaService.rating.create({
            data: {
                rating: rating / 10,
                commentary: commentary,
                movieId,
                userId,
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
        return this.prismaService.ratingLike.deleteMany({
            where: {
                ratingId,
            },
        }).then(() => {
            return this.prismaService.rating.delete({
                where: {
                    id: ratingId,
                    userId,
                },
            });
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
