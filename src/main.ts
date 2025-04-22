import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './filters/prisma-client-exception/prisma-client-exception.filter';
import { ConsoleLogger, ValidationPipe } from '@nestjs/common';

import { NestExpressApplication } from '@nestjs/platform-express';
import * as session from 'express-session';
import * as passport from 'passport';
import { EnvConfigService } from './services/env/env-config.service';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        logger: new ConsoleLogger({
            json: process.env.NODE_ENV === 'production',
        }),
    });

    app.set('trust proxy', 1); // This only works in prod btw... Trusts the proxy IP from each request

    app.setGlobalPrefix('v1/api');

    // Session management
    app.use(
        session({
            secret: EnvConfigService.getCookieSecret(true),
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: 864_000_000 },
        }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true, // This removes properties that are not in the DTO
            forbidNonWhitelisted: true, // Optional: This throws an error if non-whitelisted properties are provided
        }),
    ); // Validate DTOs received on controllers

    app.useGlobalFilters(new PrismaClientExceptionFilter());

    await app.listen(8080);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
