import { ROLES } from '@app/common/enum/common.enum';
import { ICurrentUser } from '@app/common/interfaces/common.interface';
import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {

  private logger = new Logger(AdminGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    console.log('Request', req.user);
    this.logger.log('Logging from Admin Guard')
    return (req.user as ICurrentUser).role === ROLES.ADMIN;
  }
}
