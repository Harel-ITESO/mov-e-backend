import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Request } from 'express';
import { SessionsService } from 'src/modules/sessions/sessions.service';

export class SessionAuthGuard implements CanActivate {
    constructor(
        @Inject(SessionsService)
        private readonly sessionsService: SessionsService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const sessionId = request.signedCookies['sessionId'] as string;
        if (!sessionId) return false;
        const session = await this.sessionsService.findSession(sessionId);
        if (!session) return false;

        // TODO: Add more meaningful data to avoid round trips to Postgres DB
        request.user = { id: session.userId };
        return true;
    }
}
