import { CreateUserDto } from 'src/modules/user/model/dto/create-user.dto';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class RegisterUserDto extends CreateUserDto {
    @IsNotEmpty()
    @IsStrongPassword({
        minNumbers: 1,
        minLength: 8,
        minUppercase: 1,
        minSymbols: 1,
    })
    repeatedPassword: string;
}
