import {
    IsNumber,
    IsOptional,
    IsString,
    Min,
    Max,
    Length,
    IsNotEmpty,
    IsInt,
} from 'class-validator';

export class CreateRatingDto {
    @IsInt()
    @IsNotEmpty()
    tmdbId: number;

    @IsNumber()
    @Min(0.5)
    @Max(5)
    @IsNotEmpty()
    rating: number;

    @IsOptional()
    @IsString()
    @Length(0, 1024)
    commentary?: string;
}
