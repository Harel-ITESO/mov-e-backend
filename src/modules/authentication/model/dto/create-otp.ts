import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateOtpDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
}
