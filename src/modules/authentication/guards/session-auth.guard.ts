import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Request } from 'express';
import { SessionService } from 'src/modules/session/session.service';

export class SessionAuthGuard implements CanActivate {
    constructor(
        @Inject(SessionService) private readonly sessionService: SessionService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const sessionId = request.signedCookies['sessionId'] as string;
        if (!sessionId) return false;
        const session = await this.sessionService.findSession(sessionId);
        if (!session) return false;

        request.user = { id: session.userId };
        return true;
    }
}
