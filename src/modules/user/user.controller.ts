import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { Request } from 'express';
import { User } from '@prisma/client';

// v1/api/users
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // v1/api/users/follow/:following
    @Post('follow/:following')
    @UseGuards(SessionAuthGuard)
    public followUser(
        @Req() request: Request,
        @Param('following') following: string,
    ) {
        const user = request.user as User;
        return this.userService.followUser(user.id, following);
    }

    // v1/api/users/following
    @Get('following')
    @UseGuards(SessionAuthGuard)
    public followingList(
        @Req() request: Request,
    ) {
        const user = request.user as User;
        return this.userService.followingList(user.id);
    }

    // v1/api/users/follow/:following
    @Delete('follow/:following')
    @UseGuards(SessionAuthGuard)
    public unfollowUser(
        @Req() request: Request,
        @Param('following') following: string,
    ) {
        const user = request.user as User;
        return this.userService.unfollowUser(user.id, following);
    }
}
