import { BadRequestException, Body, Controller, Delete, NotFoundException, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { CreateRatingDto } from './model/dto/create-rating';
import { Request } from 'express';
import { User } from '@prisma/client';
import { MoviesService } from '../movies/movies.service';

// v1/api/ratings
@Controller('ratings')
export class RatingController {
  constructor(
    private readonly ratingService: RatingService,
    private readonly movieService: MoviesService,
  ) { }

  // v1/api/ratings
  @Post('')
  @UseGuards(SessionAuthGuard)
  public async createRating(
    @Req() request: Request,
    @Body() { movieId, rating, commentary }: CreateRatingDto,
  ) {
    const user = request.user as User;
    if (rating % 5 != 0) {
      throw new BadRequestException('Invalid rating');
    }
    const movie = await this.movieService.createMovie(movieId);
    if (!movie) {
      throw new NotFoundException('Movie not found');
    }
    const ratingFound = await this.ratingService.getRatingByUserAndMovie(user.id, movie.id);
    if (ratingFound) {
      throw new BadRequestException('Rating already exists');
    }
    const ratingCreated = await this.ratingService.createRating(user.id, movie.id, rating, commentary);
    return {
      id: ratingCreated.id,
      rating: ratingCreated.rating.toNumber(),
      commentary: ratingCreated.commentary,
    };
  }

  // v1/api/ratings/:ratingId
  @Delete(':ratingId')
  @UseGuards(SessionAuthGuard)
  public async deleteRating(
    @Req() request: Request,
    @Param('ratingId', ParseIntPipe) ratingId: number,
  ) {
    const user = request.user as User;
    const rating = await this.ratingService.getRatingByIdAndUser(user.id, ratingId);
    if (!rating) {
      throw new NotFoundException('Rating not found');
    }
    await this.ratingService.deleteRating(user.id, ratingId);
    return { message: 'Rating deleted' };
  }

  // v1/api/ratings/:ratingId/like
  @Post(':ratingId/like')
  @UseGuards(SessionAuthGuard)
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
  @UseGuards(SessionAuthGuard)
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
      return { message: 'The like didn\'t exist' };
    }
    await this.ratingService.deleteRatingLike(user.id, ratingId);
    return { message: 'Like deleted' };
  }
}
