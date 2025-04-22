import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/model/dto/create-user.dto';
import { bcryptCompareHash, bcryptHashString } from 'src/util/hash';
import { isEmail } from 'class-validator';
import { User } from '@prisma/client';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
    constructor(
        private readonly userService: UserService,
        private readonly emailVerificationService: EmailVerificationService,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * Gets a user by his email or username
     * @param emailOrUsername The email or the username of the user
     * @returns The found user
     */
    public getUser(emailOrUsername: string) {
        if (isEmail(emailOrUsername)) {
            return this.userService.findUserWhere({ email: emailOrUsername });
        }
        return this.userService.findUserWhere({ username: emailOrUsername });
    }

    /**
     * Registers an email for pending verification
     * @param email Email to register
     * @returns Message indicating the success of the verification
     * @throws Error if the user already exists
     */
    public async registerEmailForVerification(email: string) {
        // I know this shit feels as an antipattern
        // I'll fix later if i have the time
        try {
            await this.userService.findUserWhere({ email });
        } catch {
            return await this.emailVerificationService.registerProvidedEmailForVerification(
                email,
            );
        }
        throw Error('User already exists');
    }

    /**
     * Verifies the pending verification of an email
     * @param verificationId The id of the email for verification
     * @returns JWT if found
     */
    public async verifyEmailRegistered(verificationId: string) {
        const verification =
            await this.emailVerificationService.findPendingVerification(
                verificationId,
            );
        if (!verification)
            throw new Error('Pending verification was not found');
        const { email } = verification;
        const jwt = await this.jwtService.signAsync({ email });
        return { jwt };
    }

    /**
     * Register a new user, hashes the password
     * @param userData The data of the user to register
     * @returns The created user
     */
    public async signUp(userData: CreateUserDto) {
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
}
