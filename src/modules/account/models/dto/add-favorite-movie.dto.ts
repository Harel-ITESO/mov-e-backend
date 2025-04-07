import { IsNotEmpty, ValidateNested } from 'class-validator';
import { FavoriteMovieDto } from './favorite-movie.dto';
import { Type } from 'class-transformer';

export class AddFavoriteMovieDto {
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => FavoriteMovieDto)
    favoriteMovie: FavoriteMovieDto;
}
