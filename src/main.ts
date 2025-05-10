import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './filters/prisma-client-exception/prisma-client-exception.filter';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';

import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport';
import { EnvConfigService } from './services/env/env-config.service';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import { InvalidSessionInterceptor } from './interceptors/invalid-session.intercetptor';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new ConsoleLogger({
            json: process.env.NODE_ENV === 'production',
        }),
    });

    // allow all incoming requests with credentials
    // (Since server is behing proxy, ALB should handle CORS)
    app.enableCors({ origin: true, credentials: true });

    app.set('trust proxy', 1); // This only works in prod btw... Trusts the proxy IP from each request

    app.setGlobalPrefix('v1/api');

    // Session management
    const client = createClient({ url: process.env.REDIS_SESSION_URL });
    await client.connect();
    app.use(
        session({
            secret: EnvConfigService.getCookieSecret(true),
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                maxAge: 864000000,
                sameSite:
                    process.env.NODE_ENV === 'development' ? false : 'lax',
                secure: process.env.NODE_ENV === 'production',
            },
            store: new RedisStore({
                client: client,
                ttl: 864000000,
            }),
        }),
    );

    app.useGlobalInterceptors(new InvalidSessionInterceptor());

    app.use(passport.initialize());
    app.use(passport.session());

    // Global pipes
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true, // This removes properties that are not in the DTO
            forbidNonWhitelisted: true, // Optional: This throws an error if non-whitelisted properties are provided
        }),
    ); // Validate DTOs received on controllers

    // global filters
    app.useGlobalFilters(new PrismaClientExceptionFilter());

    await app.listen(8080);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
