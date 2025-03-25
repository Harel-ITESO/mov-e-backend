import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

enum ENV {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production'
}

@Injectable()
export class EnvConfigService {
    public readonly DATABASE_URL: string;
    public readonly NODE_ENV: ENV;
    public readonly AWS_REGION: string;
    public readonly AWS_ACCESS_KEY_ID: string;
    public readonly AWS_SECRET_ACCESS_KEY: string;
    public readonly EMAIL_SENDER: string;
    public readonly TMDB_API_KEY: string;
    public readonly COOKIE_SECRET: string;
    public readonly LOCAL_AWS_ENDPOINT: string;

    constructor(private readonly configService: ConfigService) {
        this.NODE_ENV = this.configService.getOrThrow<ENV>('NODE_ENV');
        this.DATABASE_URL = this.configService.getOrThrow<string>('DATABASE_URL');
        this.EMAIL_SENDER = this.configService.getOrThrow<string>('EMAIL_SENDER');
        this.TMDB_API_KEY = this.configService.getOrThrow<string>('TMDB_API_KEY');
        this.COOKIE_SECRET = this.configService.getOrThrow<string>('COOKIE_SECRET');
        if (this.NODE_ENV == ENV.PRODUCTION) {
            this.AWS_REGION = this.configService.getOrThrow<string>('AWS_REGION');
            this.AWS_ACCESS_KEY_ID = this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
            this.AWS_SECRET_ACCESS_KEY = this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY');
        } else {
            this.LOCAL_AWS_ENDPOINT = this.configService.getOrThrow<string>('LOCAL_AWS_ENDPOINT');
        }
    }

    /**
     * Check is app is running in development environment
     * @returns True if is development environment, otherwise false
     */
    isDevEnv() {
        return this.NODE_ENV == ENV.DEVELOPMENT;
    }

    /**
     * Check is app is running in production environment
     * @returns True if is production environment, otherwise false
     */
    isProdEnv() {
        return this.NODE_ENV == ENV.PRODUCTION;
    }

    // the env variable must have the same name as above
    /**
     * Get the cookie secret retrieved from environment variables
     * @returns The cookie secret
     */
    static getCookieSecret() {
        return process.env.COOKIE_SECRET;
    }
}
