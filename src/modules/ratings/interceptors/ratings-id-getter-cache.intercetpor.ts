import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CachePrefixes } from 'src/util/cache-prefixes';

@Injectable()
export class RatingsIdGetterCacheInterceptor extends CacheInterceptor {
    protected trackBy(context: ExecutionContext): string | undefined {
        const request = context.switchToHttp().getRequest<Request>();
        const { httpAdapter } = this.httpAdapterHost;

        const isGetRequest = httpAdapter.getRequestMethod(request) === 'GET';
        if (!isGetRequest) return undefined;

        const requestedId = parseInt(request.params['id']);
        const requestSplitted = request.path.split('/');
        const resourceRequested = requestSplitted[requestSplitted.length - 2]; // 'movie' | 'rating'
        let keyPrefix: string;

        switch (resourceRequested) {
            case 'movie':
                keyPrefix = CachePrefixes.RatingsByMovieCached;
                break;
            case 'rating':
                keyPrefix = CachePrefixes.RatingDetailCached;
                break;
            default:
                return undefined;
        }
        return `${keyPrefix}-${requestedId}`;
    }
}
