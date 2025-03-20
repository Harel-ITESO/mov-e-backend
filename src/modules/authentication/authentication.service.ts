import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/model/dto/create-user.dto';
import { bcryptCompareHash, bcryptHashString } from 'src/util/hash';
import { isEmail } from 'class-validator';
import { User } from '@prisma/client';
import { SessionService } from '../session/session.service';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly userService: UserService,
        private readonly sessionsService: SessionService,
    ) {}

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
        const hashedPassword = await bcryptHashString(password);

        const userCreated = await this.userService.createUser({
            password: hashedPassword,
            ...rest,
        });
        return userCreated;
    }

    /**
     * Verifies the login data through the database
     * @param emailOrUsername The email or the username of the user
     * @param password The password of the user
     * @returns The user without the password if the data is correct, `null` otherwise
     */
    public async verifyLoginData(emailOrUsername: string, password: string) {
        const user = (await this.getUser(emailOrUsername)) as User;
        const passwordHash = user.password;
        const isPassword = await bcryptCompareHash(passwordHash, password);
        if (!isPassword) return null; // Passwords don't match
        return this.userService.filterPasswordFromUser(user);
    }

    /**
     * Generates a session for a user
     * @param userId The id of the user
     * @returns The generated session
     */
    public async generateSession(userId: number) {
        return await this.sessionsService.createSession(userId);
    }

    /**
     * Logs out from a session
     * @param sessionId The ID of the session
     */
    public async logoutFromSession(sessionId: string) {
        await this.sessionsService.deleteSession(sessionId);
    }
}
