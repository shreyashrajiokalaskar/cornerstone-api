import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class UserThrottleGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id || req.ip;
  }
}
