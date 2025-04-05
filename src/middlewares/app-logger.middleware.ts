import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP Request');
    use(request: Request, response: Response, next: NextFunction) {
        const { ip, method, originalUrl } = request;
        const userAgent = request.get('user-agent') || '';

        response.on('close', () => {
            const { statusCode } = response;
            const contentLength = response.get('content-length');

            this.logger.log(
                `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
            );
        });

        next();
    }
}
