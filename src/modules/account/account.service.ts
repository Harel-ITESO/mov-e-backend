import { Inject, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { FilesService } from '../files/files.service';
import { UpdateAccountDataDto } from './models/dto/update-account-data.dto';
import { AddFavoriteMovieDto } from './models/dto/add-favorite-movie.dto';
import { JsonArray } from '@prisma/client/runtime/library';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UserWithoutPassword } from '../user/model/types/user-without-password';
import { CachePrefixes } from 'src/util/cache-prefixes';

@Injectable()
export class AccountService {
    constructor(
        private readonly usersService: UserService,
        private readonly filesService: FilesService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    /**
     * Updates the profile cache, this allows for non stale data on store while leveraging the power of cache
     * @param userId The userId to map to cache
     * @param data The data of the user
     * @returns Cached response
     */
    private async udpateProfileCache(
        userId: number,
        data: UserWithoutPassword,
    ) {
        return await this.cacheManager.set(
            `${CachePrefixes.AccountIdentifierCached}-${userId}-profile`,
            data,
        );
    }

    /**
     * Gets the summary of an account
     * @param userId The id of the user related to such account
     * @returns The summary of his data
     */
    public async getPersonalAccountSummary(userId: number) {
        const user = await this.usersService.getUserById(userId, true);
        //TODO: Add activity summary (Average of stars given, etc)
        return user;
    }

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
        const userUpdated = await this.usersService.updateUserData(userId, {
            avatarImagePath: endpoint,
        });
        await this.udpateProfileCache(userId, userUpdated!);
        return endpoint;
    }

    /**
     * Updates user data
     * @param userId The id of the user
     * @param updateData The data to patch
     * @returns The updated user
     */
    public async updateAccountData(
        userId: number,
        updateData: UpdateAccountDataDto,
    ) {
        const userUpdated = await this.usersService.updateUserData(
            userId,
            updateData,
        );
        await this.udpateProfileCache(userId, userUpdated!);
        return userUpdated;
    }

    /**
     * Adds a new favorite movie to the user's favorite movies (Max of 3)
     * @param userId The id of the user
     * @param data The movie data
     * @returns The added movie
     */
    public async addFavoriteMovieToUser(
        userId: number,
        data: AddFavoriteMovieDto,
    ) {
        const user = await this.usersService.getUserById(userId);
        const favoriteMovies = user?.favoriteThreeMovies as JsonArray;
        // no movies yet
        if (!favoriteMovies) {
            const toAdd = [{ ...data.favoriteMovie }];
            const updatedUser =
                await this.usersService.updateFavoriteMoviesArray(
                    userId,
                    toAdd,
                );
            await this.udpateProfileCache(userId, updatedUser!);
            return toAdd;
        }

        // length of movies is greater than allowed
        if (favoriteMovies.length >= 3) {
            throw new Error('Already three favorite movies');
        }

        const toAdd = [{ ...data.favoriteMovie }, ...favoriteMovies]; // copy the array
        const updatedUser = await this.usersService.updateFavoriteMoviesArray(
            userId,
            toAdd,
        );
        await this.udpateProfileCache(userId, updatedUser!);
        return toAdd;
    }

    /**
     * Removes a favorite movie from the user's favorite movies array
     * @param userId The id of the user
     * @param arrayPosition The position in which the element to remove is in the array
     * @returns Success message
     */
    public async deleteFavoriteMovieFromUser(
        userId: number,
        arrayPosition: number,
    ) {
        const user = await this.usersService.getUserById(userId);
        const favoriteMovies = user?.favoriteThreeMovies as JsonArray;

        if (!favoriteMovies) throw new Error('There are no movies to delete');

        if (arrayPosition < 0 || arrayPosition > favoriteMovies.length - 1)
            throw new Error('Invalid array position');

        favoriteMovies.splice(arrayPosition, 1);
        const updatedUser = await this.usersService.updateFavoriteMoviesArray(
            userId,
            favoriteMovies,
        );
        await this.udpateProfileCache(userId, updatedUser!);
        return { message: 'Favorite movie removed' };
    }

    /**
     * Retrieves all ratings by the account;
     * @param userId
     * @returns
     */
    public async getAccountRatings(userId: number) {
        const { ratings } = await this.usersService.getRatingsByUser(userId);
        return ratings;
    }
}
