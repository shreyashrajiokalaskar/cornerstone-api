import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RoleEntity } from './roles/entities/role.entity';

@Injectable()
export class AppService {
  constructor(private dataSource: DataSource) {}

  async healthCheck() {
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
