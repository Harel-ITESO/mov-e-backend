import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
    @IsString()
    @IsNotEmpty()
    emailOrUsername: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
