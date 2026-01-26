import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class JwtService {
  private readonly logger = new Logger(JwtService.name);
}
