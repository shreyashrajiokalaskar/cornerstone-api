import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  private logger = new Logger(AuthGuard.name);
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    this.logger.log(`This is the token:${token}`);
    if (!token) {
      throw new UnauthorizedException();
    }
    const isInternal = request.headers['x-internal-request'];
    this.logger.log(`is request internal:${isInternal}`);
    const secret = isInternal
      ? this.configService.get('SERVICE_JWT_SECRET')
      : this.configService.get('JWT_SECRET');
    try {
      const user = await this.jwtService.verifyAsync(token, {
        secret: secret,
      });
      request['user'] = { ...user };
      return true;
    } catch (error) {
      console.error('JWT ERROR:', error.name, error.message);
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }

      throw new UnauthorizedException('Unauthorized');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
