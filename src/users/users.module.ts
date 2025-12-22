import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { UserAuthEntity } from '../user-auth/entities/user-auth.entity';
import { UserRolesEntity } from './entities/user-role.entity';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([User, UserAuthEntity, UserRolesEntity, RoleEntity])],
  exports: [UsersService],
})
export class UsersModule { }
