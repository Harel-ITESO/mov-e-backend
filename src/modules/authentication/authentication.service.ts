import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/model/dto/create-user.dto';
import { compareHash, hashString } from 'src/util/hash';
import { isEmail } from 'class-validator';
import { User } from '@prisma/client';

@Injectable()
export class AuthenticationService {
    constructor(private readonly userService: UserService) {}

    /**
     * Gets a user by his email or username
     * @param emailOrUsername The email or the username of the user
     * @returns The found user
     */
    private getUser(emailOrUsername: string) {
        if (isEmail(emailOrUsername)) {
            return this.userService.findUserWhere({ email: emailOrUsername });
        }
        return this.userService.findUserWhere({ username: emailOrUsername });
    }

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

    /**
     * Logs in a user, creates a JWT token
     * @param emailOrUsername
     * @param password
     * @returns
     */
    public async login(emailOrUsername: string, password: string) {
        const user = (await this.getUser(emailOrUsername)) as User;
        const isPassword = await compareHash(user.password, password);
        if (!isPassword) throw new Error('Invalid password');
        return user;
    }
}
