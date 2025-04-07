import { IsInt, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class FavoriteMovieDto {
    @IsInt()
    @IsNotEmpty()
    id: number;

    @IsUrl()
    @IsNotEmpty()
    posterPath: string;

    @IsString()
    title: string;
}
