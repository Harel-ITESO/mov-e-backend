import { Injectable } from '@nestjs/common';
import { FollowsService } from '../follows/follows.service';
import { UserService } from '../user/user.service';
import { Profile } from './models/types/profile';

@Injectable()
export class ProfilesService {
    constructor(
        private readonly followsService: FollowsService,
        private readonly usersService: UserService,
    ) {}

    /**
     * Gets profile data and indicates if requesting user follows him and viceversa
     * @param requestingUserId The id of the user making the request
     * @param profileUsername The username of the user to get profile data from
     * @returns Profile data
     */
    public async getProfileData(
        requestingUserId: number,
        profileUsername: string,
    ): Promise<Profile> {
        const profileFound = await this.usersService.getUserByUsername(
            profileUsername,
            true,
        );
        const userFollowsAccount = await this.followsService.getUserFollowsUser(
            profileFound!.id,
            requestingUserId,
        );
        const accountFollowsUser = await this.followsService.getUserFollowsUser(
            requestingUserId,
            profileFound!.id,
        );

        return {
            ...profileFound!,
            userFollowsAccount,
            accountFollowsUser,
        };
    }
}
