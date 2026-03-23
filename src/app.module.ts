import { RequestIdMiddleware, UserThrottleGuard } from '@app/common';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { typeOrmConfig } from './config/typeorm.config';
import { DocumentsModule } from './documents/documents.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
      storage: new ThrottlerStorageRedisService({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      }),
    }),
    UsersModule,
    AuthModule,
    RedisModule,
    DocumentsModule,
    WorkspacesModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, {
    useClass: UserThrottleGuard,
    provide: APP_GUARD
  }],
  exports: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
