import { Global, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

enum ENV {
    DEVELOPMENT = 'development',
    PRODUCTION = 'production',
}

@Global()
@Injectable()
export class EnvConfigService {
    public readonly DATABASE_URL: string;
    public readonly NODE_ENV: ENV;
    public readonly AWS_REGION: string;
    public readonly AWS_ACCESS_KEY_ID: string;
    public readonly AWS_SECRET_ACCESS_KEY: string;
    public readonly TMDB_API_KEY: string;
    public readonly COOKIE_SECRET: string;
    public readonly LOCAL_AWS_ENDPOINT: string;
    public readonly BUCKET_NAME: string;
    public readonly EMAIL_VERIFICATION_JWT_SECRET: string;
    public readonly RESET_PASSWORD_JWT_SECRET: string;
    public readonly REDIS_SESSION_URL: string;
    public readonly REDIS_CACHE_URL: string;
    public readonly SMTP_API_KEY: string;
    public readonly SMTP_NAME: string;
    public readonly SMTP_EMAIL: string;

    constructor(private readonly configService: ConfigService) {
        this.NODE_ENV = this.configService.getOrThrow<ENV>('NODE_ENV');
        this.DATABASE_URL =
            this.configService.getOrThrow<string>('DATABASE_URL');
        this.TMDB_API_KEY =
            this.configService.getOrThrow<string>('TMDB_API_KEY');
        this.COOKIE_SECRET =
            this.configService.getOrThrow<string>('COOKIE_SECRET');
        this.EMAIL_VERIFICATION_JWT_SECRET =
            this.configService.getOrThrow<string>(
                'EMAIL_VERIFICATION_JWT_SECRET',
            );
        this.RESET_PASSWORD_JWT_SECRET = this.configService.getOrThrow<string>(
            'RESET_PASSWORD_JWT_SECRET',
        );
        this.BUCKET_NAME = this.configService.getOrThrow<string>('BUCKET_NAME');
        this.REDIS_SESSION_URL =
            this.configService.getOrThrow<string>('REDIS_SESSION_URL');
        this.REDIS_CACHE_URL =
            this.configService.getOrThrow<string>('REDIS_CACHE_URL');
        if (this.NODE_ENV == ENV.PRODUCTION) {
            this.AWS_REGION =
                this.configService.getOrThrow<string>('AWS_REGION');
            this.AWS_ACCESS_KEY_ID =
                this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
            this.AWS_SECRET_ACCESS_KEY = this.configService.getOrThrow<string>(
                'AWS_SECRET_ACCESS_KEY',
            );
        } else {
            this.LOCAL_AWS_ENDPOINT =
                this.configService.getOrThrow<string>('LOCAL_AWS_ENDPOINT');
        }
        this.SMTP_API_KEY =
            this.configService.getOrThrow<string>('SMTP_API_KEY');
        this.SMTP_NAME = this.configService.getOrThrow<string>('SMTP_NAME');
        this.SMTP_EMAIL = this.configService.getOrThrow<string>('SMTP_EMAIL');
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
    static getCookieSecret(throwError?: boolean) {
        const secret = process.env.COOKIE_SECRET;
        if (throwError && !secret) {
            throw new Error(
                'Cookie secret was not found on enviroment variables',
            );
        }
        return secret || '';
    }
}
