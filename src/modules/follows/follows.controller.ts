import {
    BadRequestException,
    Controller,
    Delete,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import { FollowsService } from './follows.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { CurrentSessionUser } from '../authentication/decorators/current-session-user.decorator';
import { SessionUser } from '../authentication/models/types/session-user';

// v1/api/follows
@Controller('follows')
@UseGuards(SessionAuthGuard)
export class FollowsController {
    constructor(private readonly followsService: FollowsService) {}

    // v1/api/follows/user/:id/follow
    @Post('user/:id/follow')
    public async followUser(
        @Param('id') toFollowUserId: number,
        @CurrentSessionUser() sessionUser: SessionUser,
    ) {
        if (toFollowUserId === sessionUser.id)
            throw new BadRequestException("Can't follow yourself");
        return await this.followsService.followUser(
            sessionUser.id,
            toFollowUserId,
        );
    }

    // v1/api/follows/user/:id/unfollow
    @Delete('user/:id/unfollow')
    public async unfollowUser(
        @Param('id') toUnfollowUserId: number,
        @CurrentSessionUser() sessionUser: SessionUser,
    ) {
        if (toUnfollowUserId === sessionUser.id)
            throw new BadRequestException("Can't unfollow yourself");
        return await this.followsService.unfollowUser(
            sessionUser.id,
            toUnfollowUserId,
        );
    }
}
