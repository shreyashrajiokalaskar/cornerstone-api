import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RoleEntity } from './roles/entities/role.entity';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private dataSource: DataSource) {}

  async healthCheck() {
    this.logger.log('Running healthCheck');
    const isDatabaseConnected = await this.dataSource.isInitialized;
    const tables = await this.dataSource
      .getRepository(RoleEntity)
      .createQueryBuilder('role')
      .getMany();
    return {
      message: 'hello',
      database: isDatabaseConnected ? 'connected' : 'disconnected',
      tables: tables,
    };
  }
}
