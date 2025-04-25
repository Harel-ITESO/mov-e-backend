import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class FollowsService {
    constructor(
        private readonly usersService: UserService,
        private readonly prismaService: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    /**
     * Allows a user to follow another
     * @param followerId The id of the follower
     * @param followingId The id of the following
     * @returns The instance created
     */
    public async followUser(followerId: number, followingId: number) {
        return await this.prismaService.userFollow.create({
            data: {
                follower: {
                    connect: {
                        id: followerId,
                    },
                },
                following: {
                    connect: {
                        id: followingId,
                    },
                },
            },
        });
    }

    /**
     * Performs an unfollow from a user
     * @param followerId
     * @param followingId
     * @returns
     */
    public async unfollowUser(followerId: number, followingId: number) {
        return await this.prismaService.userFollow.delete({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
    }

    /**
     * Retrieves all followings of a user
     * @param userId
     * @returns
     */
    public async getUserFollowings(userId: number) {
        return await this.usersService.getUserFollowings(userId);
    }

    /**
     * Retrieves if a base user follows another user
     * @param baseUserId The base user which is expected to be the follower
     * @param checkUserId The user which is expected to be the followed
     * @returns Boolean
     */
    public async getUserFollowsUser(baseUserId: number, checkUserId: number) {
        const following = await this.prismaService.userFollow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: baseUserId,
                    followingId: checkUserId,
                },
            },
        });
        return !!following;
    }
}
