import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SessionAuthGuard } from '../authentication/guards/session-auth.guard';
import { Request } from 'express';
import { User } from '@prisma/client';

// v1/api/users
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    // v1/api/users/me/ratings
    @Get('me/ratings')
    @UseGuards(SessionAuthGuard)
    public deleteRating(@Req() request: Request) {
        const user = request.user as User;
        return this.userService.getRatings(user.id);
    }
}
