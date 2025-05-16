import { IsNotEmpty, IsStrongPassword } from 'class-validator';

// The class does not take into account the email for validation...
// However the flow requires that an email is provided beforehand by a JWT authorization process
export class SignupWithoutEmailDto {
    @IsNotEmpty()
    username: string;

    @IsNotEmpty()
    @IsStrongPassword({
        minNumbers: 1,
        minLength: 8,
        minUppercase: 1,
        minSymbols: 1,
    })
    repeatedPassword: string;

    @IsNotEmpty()
    @IsStrongPassword({
        minNumbers: 1,
        minLength: 8,
        minUppercase: 1,
        minSymbols: 1,
    })
    password: string;
}
