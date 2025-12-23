import { AuthGuard } from '@app/common';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { UserAuthEntity } from '../auth/entities/user-auth.entity';
import { UserRolesEntity } from './entities/user-role.entity';
import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, {
    provide: APP_GUARD,
    useClass: AuthGuard,
  }],
  imports: [TypeOrmModule.forFeature([UserEntity, UserAuthEntity, UserRolesEntity, RoleEntity])],
  exports: [UsersService],
})
export class UsersModule { }
