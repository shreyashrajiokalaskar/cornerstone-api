import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Logger } from '@nestjs/common';

const logger = new Logger('TypeORM');

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => {
  logger.debug('Building TypeORM config');
  const cfg = {
    type: 'postgres',
    host: config.get('DB_HOST'),
    port: +config.get('DB_PORT'),
    username: config.get('DB_USER'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
    autoLoadEntities: true,
    synchronize: false,
    logging: false,
  } as TypeOrmModuleOptions;
  return cfg;
};
