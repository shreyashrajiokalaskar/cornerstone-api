import { AuthProvider, ROLES } from '@app/common';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAuthEntity } from 'src/auth/entities/user-auth.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRolesEntity } from './entities/user-role.entity';
import { UserEntity } from './entities/user.entity';


@Injectable()
export class UsersService {
  constructor(@InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(UserAuthEntity) private authProviderRepo: Repository<UserAuthEntity>,
    private dataSource: DataSource) { }

  async createInternalUser(createUserDto: CreateUserDto) {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      const isEmailPresent = await manager.findOne(UserEntity, {
        where: {
          email: createUserDto.email
        }
      });

      if (isEmailPresent) {
        throw new ConflictException('Email already registered');
      }
      const user = manager.create(UserEntity,
        { email: createUserDto.email, name: createUserDto.name },
      );
      await manager.save(UserEntity, user);
      const role = await manager.findOneOrFail(RoleEntity, {
        where: { role: ROLES.USER },
      });

      const userAuth = manager.create(UserAuthEntity, {
        provider: AuthProvider.INTERNAL,
        providerUserId: user.id,
        passwordHash: createUserDto.password,
        user
      })

      await manager.save(userAuth)

      const userRole = manager.create(UserRolesEntity, {
        role,
        user
      })

      await manager.save(userRole);

      return user;
    })

  }

  async findAll() {
    return await this.userRepo.find({
      select: ['createdAt', 'email', 'id', 'name', 'updatedAt'],
    });
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: {
        id: id,
      },
      select: ['createdAt', 'email', 'id', 'name', 'updatedAt'],
    });
    if (!user) {
      console.log('USER NOT FOUND!');
      throw new NotFoundException('User not Found!');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepo.findOne({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new NotFoundException('User not Found!');
    }
    Object.assign(user, updateUserDto);

    const updatedUser = await this.userRepo.save(user);
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      updatedAt: updatedUser.updatedAt,
    };
  }

  async remove(id: string) {
    const removedUser = await this.userRepo.delete(id);
    if (!removedUser.affected) {
      throw new NotFoundException('User not found!');
    }
    return `This action removes a #${id} user`;
  }

  async findByMail(mail: string) {
    const user = await this.userRepo.findOne({
      where: {
        email: mail
      }
    });

    if (!user) {
      throw new NotFoundException('User not found!')
    }

    const authProvider = await this.authProviderRepo.findOne({
      where: {
        user: { id: user.id },
        provider: AuthProvider.INTERNAL
      }
    });

    return { ...user, password: (authProvider?.passwordHash ?? '') };
  }
}
