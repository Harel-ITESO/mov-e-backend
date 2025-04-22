import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Req,
    UseGuards,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { CreateRatingDto } from './model/dto/create-rating';
import { Request } from 'express';
import { User } from '@prisma/client';
import { CurrentSessionUser } from '../sessions/session-user.decorator';
import { SessionUser } from '../authentication/models/types/session-user';

// v1/api/ratings
@Controller('ratings')
@UseGuards(SessionAuthGuard)
export class RatingController {
    constructor(private readonly ratingService: RatingService) {}

    // v1/api/ratings
    @Post('')
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
        @Req() request: Request,
        @Param('ratingId', ParseIntPipe) ratingId: number,
    ) {
        const user = request.user as User;
        const rating = await this.ratingService.getRatingByIdAndUser(
            user.id,
            ratingId,
        );
        if (!rating) {
            throw new NotFoundException('Rating not found');
        }
        await this.ratingService.deleteRating(user.id, ratingId);
        return { message: 'Rating deleted' };
    }

    // v1/api/ratings/:ratingId/like
    @Post(':ratingId/like')
    public async createRatingLike(
        @Req() request: Request,
        @Param('ratingId', ParseIntPipe) ratingId: number,
    ) {
        const user = request.user as User;
        const rating = await this.ratingService.getRatingById(ratingId);
        if (!rating) {
            throw new NotFoundException('Rating not found');
        }
        const like = await this.ratingService.getRatingLike(user.id, ratingId);
        if (like) {
            return { message: 'The like already exists' };
        }
        await this.ratingService.createRatingLike(user.id, ratingId);
        return { message: 'Like created' };
    }

    // v1/api/ratings/:ratingId/like
    @Delete(':ratingId/like')
    public async deleteRatingLike(
        @Req() request: Request,
        @Param('ratingId', ParseIntPipe) ratingId: number,
    ) {
        const user = request.user as User;
        const rating = await this.ratingService.getRatingById(ratingId);
        if (!rating) {
            throw new NotFoundException('Rating not found');
        }
        const like = await this.ratingService.getRatingLike(user.id, ratingId);
        if (!like) {
            return { message: "The like didn't exist" };
        }
        await this.ratingService.deleteRatingLike(user.id, ratingId);
        return { message: 'Like deleted' };
    }
}
