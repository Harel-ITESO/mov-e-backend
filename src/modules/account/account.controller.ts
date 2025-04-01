import {
    Controller,
    FileTypeValidator,
    ParseFilePipe,
    Post,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { AccountService } from './account.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { SessionUser } from '../authentication/models/types/session-user';

// v1/api/account
@Controller('account')
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    // v1/api/account/profile-picture/upload
    @Post('profile-picture/upload')
    @UseGuards(SessionAuthGuard)
    @UseInterceptors(FileInterceptor('profile-picture'))
    public async uploadProfilePicture(
        @Req() request: Request,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                ],
            }),
        )
        profilePicture: Express.Multer.File,
    ) {
        const user = request.user! as SessionUser;
        const imagePath = await this.accountService.uploadProfilePictureToUser(
            profilePicture,
            user.id,
            user.username,
        );
        return { imagePath };
    }
}
