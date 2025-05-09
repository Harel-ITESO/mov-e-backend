import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { MoviesService } from '../movies/movies.service';
import { CreateRatingDto } from './model/dto/create-rating.dto';
import { Movie, Rating } from '@prisma/client';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RatingsByMovie } from './model/types/ratings-by-movie';
import { CachePrefixes } from 'src/util/cache-prefixes';
import { RatingDetail } from './model/types/rating-detail';
import { RatingsByAccount } from '../account/models/interfaces/ratings-by-account';

@Injectable()
export class RatingsService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly moviesService: MoviesService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    /**
     * Retrieves a rating by its id with complete detail if provided
     * @param ratingId The rating id
     * @param withDetail If the response must provide detail
     * @returns The rating if found, otherwise `null`
     */
    public async getRatingById(
        ratingId: number,
        withDetail?: boolean,
    ): Promise<Rating | RatingDetail> {
        // Return basic response
        if (!withDetail)
            return await this.prismaService.rating.findUniqueOrThrow({
                where: { id: ratingId },
            });

        // Get detailed data with likes count
        const detailedData = await this.prismaService.rating.findUniqueOrThrow({
            select: {
                rating: true,
                commentary: true,
                fromUser: {
                    select: {
                        id: true,
                        avatarImagePath: true,
                        username: true,
                    },
                },
                toMovie: {
                    select: {
                        title: true,
                        tmdbId: true,
                        posterPath: true,
                    },
                },
                _count: {
                    select: {
                        ratingLikes: true,
                    },
                },
            },
            where: {
                id: ratingId,
            },
        });

        // find if current requesting user has given like to this rating
        const currentUserLike = await this.prismaService.ratingLike.findUnique({
            where: {
                userId_ratingId: {
                    ratingId,
                    userId: detailedData.fromUser.id,
                },
            },
        });
        const { _count, ...rest } = detailedData;

        // Data formatting
        return {
            ...rest,
            likesCount: _count.ratingLikes,
            likeFromCurrentUser: currentUserLike !== null,
        };
    }

    /**
     * Gets all the ratings given to a movie
     * @param movieId The movie to query
     * @returns All the ratings given to that movie
     */
    public async getRatingsByMovie(movieId: number) {
        return await this.prismaService.rating.findMany({
            select: {
                id: true,
                rating: true,
                commentary: true,
                fromUser: {
                    select: {
                        username: true,
                        avatarImagePath: true,
                    },
                },
            },
            where: {
                toMovie: {
                    tmdbId: movieId,
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
    public async createRating(userId: number, data: CreateRatingDto) {
        const movieInDatabase =
            await this.moviesService.findMovieOnLocalDatabase(
                data.tmdbId,
                false,
            );
        let movieConnect: Movie | null;

        // connect movie to variable if found on db, if not create it and get the instance
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

        // create the rating
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { tmdbId, ...rest } = data; // remove tmdbId for creation
        const ratingCreated = await this.prismaService.rating.create({
            select: {
                id: true,
                rating: true,
                commentary: true,
                fromUser: {
                    select: {
                        username: true,
                        avatarImagePath: true,
                    },
                },
            },
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

        // update cache
        const ratingByMovieKey = `${CachePrefixes.RatingsByMovieCached}-${data.tmdbId}`;
        await this.updateCache<RatingsByMovie>(ratingByMovieKey, ratingCreated);

        // update accounts by rating cache
        const accountKey = `${CachePrefixes.AccountIdentifierCached}-${userId}-ratings`;
        await this.updateCache<RatingsByAccount>(accountKey, ratingCreated);

        return ratingCreated;
    }

    /**
     * Deletes a rating
     * @param userId The user id
     * @param ratingId The rating id
     * @returns The rating deleted
     */
    public async deleteRating(userId: number, ratingId: number) {
        const deleted = await this.prismaService.rating.delete({
            select: {
                toMovie: {
                    select: {
                        tmdbId: true,
                    },
                },
            },
            where: {
                id: ratingId,
                userId,
            },
        });

        // remove entire cached ratings to movie
        // this will allow for a clean repopulation of cache on next get request
        await this.cacheManager.del(
            `${CachePrefixes.AccountIdentifierCached}-${userId}-ratings`,
        );
        await this.cacheManager.del(
            `${CachePrefixes.RatingsByMovieCached}-${deleted.toMovie.tmdbId}`,
        );
        await this.cacheManager.del(
            `${CachePrefixes.RatingDetailCached}-${ratingId}`,
        );
    }

    /**
     * Creates a rating like
     * @param userId The user id
     * @param ratingId The rating id
     * @returns The rating like created
     */
    public async addLikeToRating(userId: number, ratingId: number) {
        const likeCreated = await this.prismaService.ratingLike.create({
            data: {
                userId,
                ratingId,
            },
        });
        // update cache
        const key = `${CachePrefixes.RatingDetailCached}-${ratingId}`;
        const cachedDetail = (await this.cacheManager.get(key)) as RatingDetail;
        if (!cachedDetail) return likeCreated;
        cachedDetail.likesCount++;
        cachedDetail.likeFromCurrentUser = true;
        await this.cacheManager.set(key, cachedDetail);
        return likeCreated;
    }

    /**
     * Deletes a rating like
     * @param userId The user id
     * @param ratingId The rating id
     * @returns The rating like deleted
     */
    public async deleteRatingLike(userId: number, ratingId: number) {
        const deleted = this.prismaService.ratingLike.delete({
            where: {
                userId_ratingId: {
                    userId,
                    ratingId,
                },
            },
        });
        // update cache
        const key = `${CachePrefixes.RatingDetailCached}-${ratingId}`;
        const cachedDetail = (await this.cacheManager.get(key)) as RatingDetail;
        if (!cachedDetail) return deleted;
        if (cachedDetail.likesCount - 1 >= 0) cachedDetail.likesCount--;
        cachedDetail.likeFromCurrentUser = false;
        await this.cacheManager.set(key, cachedDetail);
        return deleted;
    }
}
