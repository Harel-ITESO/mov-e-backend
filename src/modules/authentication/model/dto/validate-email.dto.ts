import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ValidateEmailDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    otp: string;
}
