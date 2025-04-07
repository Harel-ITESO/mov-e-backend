import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export default class ThrottleBehindProxy extends ThrottlerGuard {
    // eslint-disable-next-line @typescript-eslint/require-await
    protected async getTracker(request: Request): Promise<string> {
        return request.ips.length ? request.ips[0] : request.ip!;
    }
}
