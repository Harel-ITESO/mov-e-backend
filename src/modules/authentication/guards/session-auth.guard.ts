import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export class SessionAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        return request.isAuthenticated(); // Passport serializer and passport-local provide management of this method
    }
}
