import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateAccountDataDto {
    @IsOptional()
    @IsString()
    givenName?: string;

    @IsOptional()
    @IsString()
    familyName?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    @IsUrl({ require_protocol: true, protocols: ['https'] })
    website?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    bio?: string;
}
