import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CreateUserDto } from './model/dto/create-user.dto';
import { UserWithoutPassword } from './model/types/user-without-password';
import { isValidId } from 'src/util/regex';

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
     * @param userId The user id
     * @param filterPassword If false, the password won't be removed from user data
     * @returns The user if found or `null`
     */
    public async getUserById(userId: number, filterPassword?: boolean): Promise<User | UserWithoutPassword | null> {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId,
            },
        });
        if (!user) {
            return user;
        }
        if (typeof filterPassword == 'boolean' && !filterPassword) {
            return user;
        }
        return this.filterPasswordFromUser(user);
    }

    /**
     * Find a user by his ID, throw a `NotFoundException` if not found
     * @param userId The user id
     * @param filterPassword If false, the password won't be removed from user data
     * @returns The user if found, otherwise throw an exception
     */
    public async getUserByIdOrThrow(userId: number, filterPassword?: boolean): Promise<User | UserWithoutPassword> {
        const user = await this.getUserById(userId, filterPassword);
        if (!user) {
            throw new NotFoundException('User not found');
        }
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
                emailValidated: false,
            },
        });
        return this.filterPasswordFromUser(userCreated);
    }

    /**
     * Updates the user data on database
     * @param id The user id
     * @param userData The user data to update
     * @returns The user updated
     */
    public async updateUser(id: number, userData: User): Promise<User> {
        const userUpdated = await this.prismaService.user.update({
            data: userData,
            where: {
                id
            }
        });
        return userUpdated;
    }

    /**
     * Creates follow relationship between 2 users
     * @param followerId The follower id
     * @param following The followee id as string (it will be validated)
     * @returns The HttpResponse
     */
    public async followUser(followerId: number, following: string) {
        if (!isValidId(following)) {
            throw new BadRequestException('User ID must be a number');
        }
        const followingId = parseInt(following);
        if (followerId == followingId) {
            throw new BadRequestException('Follower and followee can\'t be the same user');
        }
        await this.getUserByIdOrThrow(followingId);
        const params = {
            followerId,
            followingId,
        };
        const relation = await this.prismaService.userFollow.findUnique({
            where: {
                followerId_followingId: params,
            }
        });
        if (relation) {
            return { message: 'The follow relationship already exists', };
        }
        await this.prismaService.userFollow.create({ data: params, });
        return { message: 'Follow relationship created', };
    }

    /**
     * Retrieves the users list followed by a user
     * @param followerId The follower id
     * @returns The HttpResponse with the list of users followed
     */
    public async followingList(followerId: number) {
        const following = await this.prismaService.userFollow.findMany({
            where: { followerId }
        });
        const users = await Promise.all(
            following.map(followRelation => {
                return this.getUserById(followRelation.followingId);
            })
        );
        const usersFormatted = users.map((user: User) => this.filterUserData(user));
        return { following: usersFormatted };
    }

    /**
     * Deletes follow relationship between 2 users
     * @param followerId The follower id
     * @param following The followee id as string (it will be validated)
     * @returns The HttpResponse
     */
    public async unfollowUser(followerId: number, following: string) {
        if (!isValidId(following)) {
            throw new BadRequestException('User ID must be a number');
        }
        const followingId = parseInt(following);
        const params = {
            followerId,
            followingId,
        };
        const relation = await this.prismaService.userFollow.findUnique({
            where: {
                followerId_followingId: params,
            },
        });
        if (!relation) {
            return { message: 'The follow relationship didn\'t exist' };
        }
        await this.prismaService.userFollow.delete({
            where: {
                followerId_followingId: params,
            }
        });
        return { message: 'Follow relationship deleted' };
    }

    /**
     * Filter user data before sending to client
     * @param user The user data
     * @returns New object without password, emailValidated
     */
    public filterUserData(user: User) {
        const {
            avatarImagePath,
            bio,
            email,
            familyName,
            givenName,
            id,
            location,
            username,
            website,
        } = user;
        return {
            avatarImagePath,
            bio,
            email,
            familyName,
            givenName,
            id,
            location,
            username,
            website,
        };
    }
}
