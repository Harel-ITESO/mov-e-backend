// Custom cache interceptor for each individual account
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { SessionUser } from 'src/modules/authentication/models/types/session-user';
import { CachePrefixes } from 'src/util/cache-prefixes';

@Injectable()
export class AccountCacheInterceptor extends CacheInterceptor {
    protected trackBy(context: ExecutionContext): string | undefined {
        const request = context.switchToHttp().getRequest<Request>();
        const { httpAdapter } = this.httpAdapterHost;

        const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';
        if (!isGetRequest) return undefined;

        const user = request.user as SessionUser;
        const pathAsArray = request.path.split('/');
        const identifier = pathAsArray[pathAsArray.length - 1];
        const key = `${CachePrefixes.AccountIdentifierCached}-${user.id}-${identifier}`;
        return key;
    }
}
