import 'dotenv/config';
import { join } from 'path';
import { DataSource } from 'typeorm';

// Standalone TypeORM DataSource for CLI usage (migrations, etc.)
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USER || 'cornerstone_user',
  password: process.env.DB_PASSWORD || 'cornerstone_password',
  database: process.env.DB_NAME || 'cornerstone_db',
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, '..', 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: false,
});

export default AppDataSource;
