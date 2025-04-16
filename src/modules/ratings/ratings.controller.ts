import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { CreateRatingDto } from './model/dto/create-rating.dto';
import { CurrentSessionUser } from '../sessions/session-user.decorator';
import { SessionUser } from '../authentication/models/types/session-user';

// v1/api/ratings
@Controller('ratings')
@UseGuards(SessionAuthGuard)
export class RatingsController {
    constructor(private readonly ratingService: RatingsService) {}

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

        const created = await this.ratingService.createRating(id, data);
        if (!created)
            throw new NotFoundException(
                "Rating can't be created on non existent movie",
            );
        return created;
    }

    // v1/api/ratings/:ratingId
    @Delete(':ratingId')
    public async deleteRating(
        @CurrentSessionUser() user: SessionUser,
        @Param('ratingId', ParseIntPipe) ratingId: number,
    ) {
        await this.ratingService.deleteRating(user.id, ratingId);
        return { message: 'Rating deleted' };
    }

    // v1/api/ratings/:ratingId/like
    @Post(':ratingId/like')
    public async createRatingLike(
        @CurrentSessionUser() user: SessionUser,
        @Param('ratingId') ratingId: number,
    ) {
        await this.ratingService.createRatingLike(user.id, ratingId);
        return { message: 'Like created' };
    }

    // v1/api/ratings/:ratingId/like
    @Delete(':ratingId/like')
    public async deleteRatingLike(
        @CurrentSessionUser() user: SessionUser,
        @Param('ratingId', ParseIntPipe) ratingId: number,
    ) {
        await this.ratingService.deleteRatingLike(user.id, ratingId);
        return { message: 'Like deleted' };
    }
}
