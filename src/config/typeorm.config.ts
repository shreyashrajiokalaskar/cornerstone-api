import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const logger = new Logger('TypeORM');

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => {
  const isSSL = config.get('DB_SSL') === 'true';

  logger.debug('Building TypeORM config');
  const cfg = {
    type: 'postgres',
    host: config.get('DB_HOST'),
    port: Number(config.get('DB_PORT')),
    username: config.get('DB_USER'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
    autoLoadEntities: true,
    synchronize: false,
    logging: true,
    ssl: isSSL,
    extra: {
      ssl: {
        rejectUnauthorized: false, // Ensures compatibility with serverless environments
      },
    },
    connectTimeoutMS: 10000, // 👈 add this
  } as TypeOrmModuleOptions;
  return cfg;
};
