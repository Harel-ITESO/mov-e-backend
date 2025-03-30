import { IsNumber, IsOptional, IsString, Min, Max, Length, IsInt } from 'class-validator';

export class CreateRatingDto {
  @IsInt()
  movieId: number;

  @IsNumber()
  @Min(5)
  @Max(50)
  rating: number;

  @IsOptional()
  @IsString()
  @Length(0, 1024)
  commentary?: string;
}
