import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './filters/prisma-client-exception/prisma-client-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { EnvConfigService } from './services/env/env-config.service';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('v1/api');

    app.use(cookieParser(EnvConfigService.getCookieSecret())); // Parse cookies

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
