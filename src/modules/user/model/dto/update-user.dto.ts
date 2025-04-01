import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateUserDto {
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

    @IsOptional()
    @IsString()
    @IsUrl(
        { host_whitelist: ['localhost', 'localstack', 'amazonaws.com'] },
        { message: 'Provided url is not valid' },
    )
    avatarImagePath?: string;
}
