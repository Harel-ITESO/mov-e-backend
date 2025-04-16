import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    FileTypeValidator,
    Get,
    ParseFilePipe,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { AccountService } from './account.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SessionUser } from '../authentication/models/types/session-user';
import { UpdateAccountDataDto } from './models/dto/update-account-data.dto';
import { AddFavoriteMovieDto } from './models/dto/add-favorite-movie.dto';
import { CurrentSessionUser } from '../sessions/session-user.decorator';

// v1/api/account
@Controller('account')
@UseGuards(SessionAuthGuard)
export class AccountController {
    constructor(private readonly accountService: AccountService) {}

    // v1/api/account/profile
    @Get('profile')
    public async getProfileData(@CurrentSessionUser() user: SessionUser) {
        return await this.accountService.getPersonalAccountSummary(user.id);
    }

    // v1/api/account/ratings
    @Get('ratings')
    public async getAccountRatings(@CurrentSessionUser() user: SessionUser) {
        return await this.accountService.getAccountRatings(user.id);
    }

    // v1/api/account/profile-picture/upload
    @Post('profile-picture/upload')
    @UseInterceptors(FileInterceptor('profile-picture'))
    public async uploadProfilePicture(
        @CurrentSessionUser() user: SessionUser,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                ],
            }),
        )
        profilePicture: Express.Multer.File,
    ) {
        const imagePath = await this.accountService.uploadProfilePictureToUser(
            profilePicture,
            user.id,
            user.username,
        );
        return { imagePath };
    }

    // v1/api/account/update
    @Patch('update')
    public async updateAccountData(
        @CurrentSessionUser() user: SessionUser,
        @Body() data: UpdateAccountDataDto,
    ) {
        if (!data)
            throw new BadRequestException('Update data was not provided');

        let hasKeys = false;
        for (const key in data) {
            if (data[key]) {
                hasKeys = true;
                break;
            }
        }
        if (!hasKeys)
            throw new BadRequestException('Update data was provided empty');

        await this.accountService.updateAccountData(user.id, data);
        return { updated: true };
    }

    // v1/api/account/favorite-movie
    @Patch('favorite-movie')
    public async addFavoriteMovie(
        @CurrentSessionUser() user: SessionUser,
        @Body() data: AddFavoriteMovieDto,
    ) {
        try {
            const result = await this.accountService.addFavoriteMovieToUser(
                user.id,
                data,
            );
            return result;
        } catch (e) {
            if (e instanceof Error) throw new BadRequestException(e.message);
        }
    }

    // v1/api/account/favorite-movie
    @Delete('favorite-movie')
    public async deleteFavoriteMovie(
        @CurrentSessionUser() user: SessionUser,
        @Query('position') position: number,
    ) {
        if (!position && position !== 0)
            throw new BadRequestException('Position must be provided');
        try {
            return await this.accountService.deleteFavoriteMovieFromUser(
                user.id,
                position,
            );
        } catch (e) {
            if (e instanceof Error) throw new BadRequestException(e.message);
        }
    }
}
