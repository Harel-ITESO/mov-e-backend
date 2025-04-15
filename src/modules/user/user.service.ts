import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CreateUserDto } from './model/dto/create-user.dto';
import { UserWithoutPassword } from './model/types/user-without-password';
import { UpdateUserDto } from './model/dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    /**
     * Remove password from user data
     * @param user The user data to filter
     * @returns The filtered user data
     */
    public filterPasswordFromUser(
        user: User | null,
    ): UserWithoutPassword | null {
        if (!user) return null;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = user;
        return rest;
    }

    /**
     * Find a user by his ID
     * @param userId Id of the user
     * @returns The user if found or `null`
     */
    public async getUserById(userId: number, filterPassword?: boolean) {
        const user = await this.prismaService.user.findFirstOrThrow({
            where: {
                id: userId,
            },
        });
        if (filterPassword) return this.filterPasswordFromUser(user);
        return user;
    }

    /**
     * Finds a user by a given WHERE clause
     * You can use this method to find a user by email, username, etc.
     * @param whereClause The WHERE clause to find the user
     */
    public async findUserWhere(
        whereClause: Prisma.UserWhereUniqueInput,
        filterPassword?: boolean,
    ) {
        const user = await this.prismaService.user.findFirstOrThrow({
            where: whereClause,
        });
        if (filterPassword) return this.filterPasswordFromUser(user);
        return user;
    }

    /**
     * Creates a new user on the Database (Email and Username must be unique)
     * @param userData the data of the user to create
     * @returns The created user
     */
    public async createUser(userData: CreateUserDto) {
        const { email, password, username } = userData;
        const userCreated = await this.prismaService.user.create({
            data: {
                username,
                email,
                password,
            },
        });
        return this.filterPasswordFromUser(userCreated);
    }

    /**
     * Updates data of a user
     * @param userId The id of the user to update data for
     * @param data The data to put
     * @returns The user with updated data
     */
    public async updateUserData(
        userId: number,
        data: UpdateUserDto,
    ): Promise<User> {
        const userUpdated = await this.prismaService.user.update({
            data,
            where: {
                id: userId,
            },
        });
        return userUpdated;
    }

    /**
     * Endpoint for specifically updating the array value in FavoriteThreeMovies
     * @param userId The id of the user
     * @param array The array in the form of a record of <string, any>
     * @returns The updated user
     */
    public async updateFavoriteMoviesArray(
        userId: number,
        array: Record<string, any>,
    ) {
        const userUpdated = await this.prismaService.user.update({
            data: {
                favoriteThreeMovies: array,
            },
            where: {
                id: userId,
            },
        });
        return userUpdated;
    }

    /**
     * Retrieves all the ratings a user has done
     * @param userId The user id
     * @returns The ratings found
     */
    async getRatings(userId: number) {
        const ratings = await this.prismaService.rating.findMany({
            where: { userId },
            include: { toMovie: true },
        });
        const ratingsFiltered = await Promise.all(
            ratings.map(async (rating) => {
                const likes = await this.prismaService.ratingLike.count({
                    where: { ratingId: rating.id },
                });
                const myLike = await this.prismaService.ratingLike.findUnique({
                    where: {
                        userId_ratingId: {
                            ratingId: rating.id,
                            userId,
                        },
                    },
                });
                const hasMyLike = !!myLike;
                return {
                    rating: {
                        id: rating.id,
                        rating: rating.rating.toNumber(),
                        commentary: rating.commentary,
                        likes,
                        hasMyLike,
                    },
                    movie: {
                        id: rating.toMovie.tmdbId,
                        title: rating.toMovie.title,
                        genres: rating.toMovie.genres,
                        overview: rating.toMovie.overview,
                        posterPath: rating.toMovie.posterPath,
                        year: rating.toMovie.year,
                        duration: rating.toMovie.duration,
                    },
                };
            }),
        );
        return { ratings: ratingsFiltered };
    }
}
