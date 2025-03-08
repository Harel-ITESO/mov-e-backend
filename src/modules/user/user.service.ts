import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { CreateUserDto } from './model/create-user.dto';
import { hashString } from 'src/util/hash';

@Injectable()
export class UserService {
    constructor(private readonly prismaService: PrismaService) {}

    /**
     * Remove password from user data
     * @param user The user data to filter
     * @returns The filtered user data
     */
    private filterPasswordFromUser(user: User | null) {
        if (!user) return null;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = user;
        return rest;
    }

    /**
     * Find a user by his ID
     * @param userId Id of the user
     * @returns The user if found or `null`
     */
    public async getUserById(userId: number) {
        const user = await this.prismaService.user.findFirst({
            where: {
                id: userId,
            },
        });
        return this.filterPasswordFromUser(user);
    }

    /**
     * Creates a new user on the Database (Email and Username must be unique)
     * @param userData the data of the user to create
     * @returns The created user
     */
    public async createUser(userData: CreateUserDto) {
        const { email, password, username } = userData;
        const hashedPassword = await hashString(password);
        const userCreated = await this.prismaService.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                emailValidated: false,
            },
        });
        return this.filterPasswordFromUser(userCreated);
    }
}
