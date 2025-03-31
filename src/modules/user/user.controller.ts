import { BadRequestException, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { Request } from 'express';
import { User } from '@prisma/client';

// v1/api/users
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // v1/api/users/follow/:followingId
    @Post('follow/:followingId')
    @UseGuards(SessionAuthGuard)
    public async followUser(
        @Req() request: Request,
        @Param('followingId', ParseIntPipe) followingId: number,
    ) {
        const user = request.user as User;
        const followerId = user.id;
        if (followerId == followingId) {
            throw new BadRequestException('Follower and followee can\'t be the same user');
        }
        const followingUser = await this.userService.getUserById(followingId);
        if (!followingUser) {
            throw new NotFoundException('User not found');
        }
        const relation = await this.userService.getFollowRelation(followerId, followingId);
        if (relation) {
            return { message: 'The follow relationship already exists', };
        }
        await this.userService.createFollowRelation(followerId, followingId);
        return { message: 'Follow relationship created', };
    }

    // v1/api/users/following
    @Get('following')
    @UseGuards(SessionAuthGuard)
    public async followingList(
        @Req() request: Request,
    ) {
        const user = request.user as User;
        const following = await this.userService.getAllFollowRelations(user.id);
        return { following, };
    }

    // v1/api/users/follow/:followingId
    @Delete('follow/:followingId')
    @UseGuards(SessionAuthGuard)
    public async unfollowUser(
        @Req() request: Request,
        @Param('followingId', ParseIntPipe) followingId: number,
    ) {
        const user = request.user as User;
        const followerId = user.id;
        const followingUser = await this.userService.getUserById(followingId);
        if (!followingUser) {
            throw new NotFoundException('User not found');
        }
        const relation = await this.userService.getFollowRelation(followerId, followingId);
        if (!relation) {
            return { message: 'The follow relationship didn\'t exist' };
        }
        await this.userService.deleteFollowRelation(followerId, followingId);
        return { message: 'Follow relationship deleted' };
    }
}
