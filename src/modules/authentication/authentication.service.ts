import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/model/dto/create-user.dto';
import { hashString } from 'src/util/hash';

@Injectable()
export class AuthenticationService {
    constructor(private readonly userService: UserService) {}

    /**
     * Register a new user, hashes the password
     * @param userData The data of the user to register
     * @returns The created user
     */
    public async register(userData: CreateUserDto) {
        const { password, ...rest } = userData;
        const hashedPassword = await hashString(password);

        const userCreated = await this.userService.createUser({
            password: hashedPassword,
            ...rest,
        });
        return userCreated;
    }
}
