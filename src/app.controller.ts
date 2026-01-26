import { Public } from '@app/common';
import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health-check')
  getHello() {
    this.logger.log('Health-check endpoint called');
    return this.appService.healthCheck();
  }
}
