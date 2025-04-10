import { Type } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsString,
    IsUrl,
    Min,
} from 'class-validator';

export class CreateMovieDto {
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    tmdbId: number;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    @IsArray({ each: true })
    @Type(() => String)
    genres: string[];

    @IsString()
    @IsNotEmpty()
    overview: string;

    @IsUrl({
        host_whitelist: ['api.themoviedb.org'],
        require_host: true,
        require_protocol: true,
        protocols: ['https'],
    })
    @IsNotEmpty()
    posterPath: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1888, {
        message: 'Invalid movie year, oldest movie available is from 1888',
    })
    year: number;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    duration: number;
}
