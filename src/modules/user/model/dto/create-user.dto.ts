import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsStrongPassword({
        minNumbers: 1,
        minLength: 8,
        minUppercase: 1,
        minSymbols: 1,
    })
    password: string;
}
