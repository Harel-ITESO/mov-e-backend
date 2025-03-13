import { Controller } from '@nestjs/common';
import { UserService } from './user.service';

// v1/api/user
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
}
