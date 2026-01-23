import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    console.log('User from Request', user);

    if (!req.headers['x-internal-request']) {
      throw new ForbiddenException('Internal header missing');
    }

    // 2️⃣ Must be a service token
    if (!user?.sub?.startsWith('service:')) {
      throw new ForbiddenException('Service token required');
    }

    // 3️⃣ Must have export permission
    if (!user.scope?.includes('export:read')) {
      throw new ForbiddenException('Missing export permission');
    }
    return true;
  }
}
