import { CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Request } from 'express';

export class SessionAuthGuard implements CanActivate {
    private readonly logger = new Logger(SessionAuthGuard.name);
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const authenticated = request.isAuthenticated(); // Passport serializer and passport-local provide management of this method
        if (authenticated)
            this.logger.log(
                `Request from authenticated client with session ID '${request.sessionID}' To route '${request.path}'`,
            );
        return authenticated;
    }
}
