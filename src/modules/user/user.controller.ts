import { Controller } from '@nestjs/common';
import { UserService } from './user.service';

// v1/api/users
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
}
