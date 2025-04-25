import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    NotFoundException,
    Param,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { CreateRatingDto } from './model/dto/create-rating.dto';
import { CurrentSessionUser } from '../authentication/decorators/current-session-user.decorator';
import { SessionUser } from '../authentication/models/types/session-user';
import { Rating } from '@prisma/client';
import { RatingsIdGetterCacheInterceptor } from './interceptors/ratings-id-getter-cache.intercetpor';

// v1/api/ratings
@Controller('ratings')
@UseGuards(SessionAuthGuard)
export class RatingsController {
    constructor(private readonly ratingsService: RatingsService) {}

    // v1/api/ratings/movie/:id
    @Get('movie/:id')
    @UseInterceptors(RatingsIdGetterCacheInterceptor)
    public async getRatingsByMovie(@Param('id') movieId: number) {
        return (await this.ratingsService.getRatingsByMovie(movieId)) || [];
    }

    // v1/api/ratings/rating/:id
    @Get('rating/:id')
    @UseInterceptors(RatingsIdGetterCacheInterceptor)
    public async getRatingDetailById(@Param('id') ratingId: number) {
        return await this.ratingsService.getRatingById(ratingId, true);
    }

    // v1/api/ratings/rating
    @Post('rating')
    public async createRating(
        @CurrentSessionUser() user: SessionUser,
        @Body() data: CreateRatingDto,
    ) {
        const { id } = user;
        // 0.5, 1, 1.5...
        if ((data.rating * 10) % 5 != 0)
            throw new BadRequestException('Invalid rating value');

        const created = await this.ratingsService.createRating(id, data);
        if (!created)
            throw new NotFoundException(
                "Rating can't be created on non existent movie",
            );
        return created;
    }

    // v1/api/ratings/:ratingId/like
    @Post(':ratingId/like')
    public async addLikeToRating(
        @CurrentSessionUser() user: SessionUser,
        @Param('ratingId') ratingId: number,
    ) {
        await this.ratingsService.addLikeToRating(user.id, ratingId);
        return { message: 'Like created' };
    }

    // v1/api/ratings/:ratingId
    @Delete(':ratingId')
    public async deleteRating(
        @CurrentSessionUser() user: SessionUser,
        @Param('ratingId') ratingId: number,
    ) {
        const rating = (await this.ratingsService.getRatingById(
            ratingId,
        )) as Rating;
        if (rating.userId !== user.id)
            throw new ForbiddenException(
                "Can't delete a rating which is not yours",
            );
        await this.ratingsService.deleteRating(user.id, ratingId);
        return { message: 'Rating deleted' };
    }

    // v1/api/ratings/:ratingId/like
    @Delete(':ratingId/like')
    public async deleteRatingLike(
        @CurrentSessionUser() user: SessionUser,
        @Param('ratingId') ratingId: number,
    ) {
        await this.ratingsService.deleteRatingLike(user.id, ratingId);
        return { message: 'Like deleted' };
    }
}
