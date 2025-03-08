import { Controller } from '@nestjs/common';
import { UserService } from './user.service';

// http://localhost:8080/v1/api/user
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
}
