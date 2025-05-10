import {
    CallHandler,
    ExecutionContext,
    HttpException,
    Logger,
    NestInterceptor,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { catchError, Observable, throwError } from 'rxjs';

export class InvalidSessionInterceptor implements NestInterceptor {
    private readonly logger = new Logger(InvalidSessionInterceptor.name);

    intercept(
        context: ExecutionContext,
        next: CallHandler<any>,
    ): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            catchError((e) => {
                if (e instanceof UnauthorizedException) {
                    const request = context
                        .switchToHttp()
                        .getRequest<Request>();

                    if (!request.isAuthenticated())
                        request.session.destroy((e) => {
                            this.logger.error(e);
                        });
                }
                return throwError(() => e as HttpException);
            }),
        );
    }
}
