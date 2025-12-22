import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { map, Observable } from 'rxjs';

interface IResponse {
  success: boolean;
  statusCode: number;
  data: any;
}

@Injectable()
export class ReponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<IResponse>,
  ): Observable<IResponse> {
    const response = context.switchToHttp().getResponse<ExpressResponse>();
    const statusCode = response.statusCode; // Grab the 200/201 code
    return next.handle().pipe(
      map((data: IResponse) => ({
        success: true,
        statusCode,
        data,
      })),
    );
  }
}
