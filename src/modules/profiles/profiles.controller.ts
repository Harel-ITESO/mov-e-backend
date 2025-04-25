import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { CurrentSessionUser } from '../authentication/decorators/current-session-user.decorator';
import { SessionUser } from '../authentication/models/types/session-user';
import { Response } from 'express';

@Controller('profiles')
@UseGuards(SessionAuthGuard)
export class ProfilesController {
    constructor(private readonly profilesService: ProfilesService) {}

    // v1/api/profiles/profile/:username
    @Get('profile/:username')
    public async getUserProfile(
        @Param('username') username: string,
        @CurrentSessionUser() user: SessionUser,
        @Res({ passthrough: true }) response: Response,
    ) {
        if (username === user.username)
            return response.redirect('/v1/api/account/profile');
        return await this.profilesService.getProfileData(user.id, username);
    }
}
