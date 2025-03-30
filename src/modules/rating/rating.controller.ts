import { Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { CreateRatingDto } from './model/dto/create-rating';
import { Request } from 'express';
import { User } from '@prisma/client';

// v1/api/ratings
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // v1/api/ratings
  @Post('')
  @UseGuards(SessionAuthGuard)
  public createRating(
    @Req() request: Request,
    @Body() { movieId, rating, commentary }: CreateRatingDto,
  ) {
    const user = request.user as User;
    return this.ratingService.createRating(user.id, movieId, rating, commentary!);
  }

  // v1/api/ratings/:ratingId
  @Delete(':ratingId')
  @UseGuards(SessionAuthGuard)
  public deleteRating(
    @Param('ratingId') ratingId: string,
  ) {
    return this.ratingService.deleteRating(ratingId);
  }

  // v1/api/ratings/:ratingId/like
  @Post(':ratingId/like')
  @UseGuards(SessionAuthGuard)
  public createLikeRating(
    @Req() request: Request,
    @Param('ratingId') ratingId: string,
  ) {
    const user = request.user as User;
    return this.ratingService.createLikeRating(user.id, ratingId);
  }

  // v1/api/ratings/:ratingId/like
  @Delete(':ratingId/like')
  @UseGuards(SessionAuthGuard)
  public deleteLikeRating(
    @Req() request: Request,
    @Param('ratingId') ratingId: string,
  ) {
    const user = request.user as User;
    return this.ratingService.deleteLikeRating(user.id, ratingId);
  }
}
