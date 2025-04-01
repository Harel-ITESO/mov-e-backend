import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { FilesService } from '../files/files.service';

@Injectable()
export class AccountService {
    constructor(
        private readonly usersService: UserService,
        private readonly filesService: FilesService,
    ) {}

    /**
     * Uploads a profile picture for a user
     * @param profilePicture The profile picture of the user to upload
     * @param userId The id of the user
     * @param username The user's username (For naming)
     * @returns The endpoint
     */
    public async uploadProfilePictureToUser(
        profilePicture: Express.Multer.File,
        userId: number,
        username: string,
    ) {
        const fileName = `${username}-profile-picture.${profilePicture.mimetype.split('/')[1]}`;
        const endpoint = await this.filesService.uploadFile(
            profilePicture,
            fileName,
        );
        await this.usersService.updateUserData(userId, {
            avatarImagePath: endpoint,
        });
        return endpoint;
    }
}
