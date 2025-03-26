import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  username?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  givenName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  familyName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarImagePath?: string;
}
// A data transfer was created to define the data that can be updated in the user profile. The class-validator library was used to define the validation rules for each field. The class-validator library is a library that allows you to define validation rules for the properties of a class.
