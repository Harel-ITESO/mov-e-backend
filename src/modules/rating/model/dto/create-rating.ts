import {
    IsNumber,
    IsOptional,
    IsString,
    Min,
    Max,
    Length,
    IsInt,
} from 'class-validator';

export class CreateRatingDto {
    @IsInt()
    tmdbId: number;

    @IsNumber()
    @Min(0.5)
    @Max(5)
    rating: number;

    @IsOptional()
    @IsString()
    @Length(0, 1024)
    commentary?: string;
}
