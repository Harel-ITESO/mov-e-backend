import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MoviesService } from '../movies/movies.service';
import { isValidId } from 'src/util/regex';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class RatingService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly movieService: MoviesService,
    ) {}

    /**
     * Finds a rating by the id
     * @param _ratingId The rating id
     * @returns The rating if found, otherwise `null`
     */
    findRating(_ratingId: string) {
        if (!isValidId(_ratingId)) {
            throw new BadRequestException('Rating ID must be a number');
        }
        const ratingId = parseInt(_ratingId);
        return this.prismaService.rating.findUnique({
            where: { id: ratingId, }
        });
    }

    /**
     * Finds a rating by the id, throws a `NotFoundException` if not found
     * @param ratingId The rating id
     * @returns The rating if found, otherwise throws an exception
     */
    async findRatingOrThrow(ratingId: string) {
        const rating = await this.findRating(ratingId);
        if (!rating) {
            throw new NotFoundException('Rating not found');
        }
        return rating;
    }

    /**
     * Creates a rating linked to a movie and a user
     * @param userId The user id
     * @param movieId The movie id (it will be validated)
     * @param ratingValue The value to rate the movie (it will be validated)
     * @param commentary The commentary linked to the rating
     * @returns The HttpResponse
     */
    async createRating(userId: number, movieId: number, ratingValue: number, commentary: string) {
        if (ratingValue % 5 != 0) {
            throw new BadRequestException('Invalid rating');
        }
        const movie = await this.movieService.createMovieOrThrow(movieId);
        const ratingFound = await this.prismaService.rating.findUnique({
            where: {
                userId_movieId: {
                    userId,
                    movieId: movie.id,
                },
            },
        });
        if (ratingFound) {
            throw new BadRequestException('Rating already exists');
        }
        await this.prismaService.rating.create({
            data: {
                rating: ratingValue / 10,
                commentary: commentary,
                movieId: movie.id,
                userId: userId,
            },
        });
        return { message: 'Rating created' };
    }

    /**
     * Deletes a rating linked to a movie and a user
     * @param ratingId The rating id
     * @returns The HttpResponse
     */
    async deleteRating(ratingId: string) {
        const rating = await this.findRatingOrThrow(ratingId);
        await this.prismaService.ratingLike.deleteMany({
            where: {
                ratingId: rating.id,
            },
        });
        await this.prismaService.rating.delete({
            where: { id: rating.id, },
        });
        return { message: 'Rating deleted' }
    }

    /**
     * Creates a like linked to a rating and a user
     * @param userId The user id
     * @param ratingId The rating id
     * @returns The HttpResponse
     */
    async createLikeRating(userId: number, ratingId: string) {
        const rating = await this.findRatingOrThrow(ratingId);
        const params = {
            ratingId: rating.id,
            userId,
        };
        const like = await this.prismaService.ratingLike.findUnique({
            where: {
                userId_ratingId: params,
            },
        });
        if (like) {
            return { message: 'The like already exists' };
        }
        await this.prismaService.ratingLike.create({
            data: params,
        });
        return { message: 'Like created' };
    }

    /**
     * Deletes a like linked to a rating and a user
     * @param userId The user id
     * @param ratingId The rating id
     * @returns The HttpResponse
     */
    async deleteLikeRating(userId: number, ratingId: string) {
        const rating = await this.findRatingOrThrow(ratingId);
        const params = {
            ratingId: rating.id,
            userId,
        };
        const like = await this.prismaService.ratingLike.findUnique({
            where: {
                userId_ratingId: params,
            },
        });
        if (!like) {
            return { message: 'The like didn\'t exist' };
        }
        await this.prismaService.ratingLike.delete({
            where: {
                userId_ratingId: params,
            },
        });
        return { message: 'Like deleted' };
    }
}
