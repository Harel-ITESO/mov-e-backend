import { IsEmail, IsNotEmpty } from 'class-validator';

export class RegisterEmailDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
