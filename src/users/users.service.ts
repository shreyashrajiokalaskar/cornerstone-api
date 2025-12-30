import { AuthProvider, ROLES } from '@app/common';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAuthEntity } from 'src/auth/entities/user-auth.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateInternalUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRolesEntity } from './entities/user-role.entity';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(UserAuthEntity)
    private authProviderRepo: Repository<UserAuthEntity>,
    @InjectRepository(UserRolesEntity)
    private userRolesRepo: Repository<UserRolesEntity>,
    @InjectRepository(RoleEntity)
    private roleRepo: Repository<RoleEntity>,
    private dataSource: DataSource,
  ) {}

  async createInternalUser(createUserDto: CreateInternalUserDto) {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      this.logger.debug('STARTING TRANSACTION FROM HERE');
      const userDetails = await manager.findOne(UserEntity, {
        where: {
          email: createUserDto.email,
        },
      });

      if (userDetails) {
        const alreadyInternalUser = await manager.findOne(UserAuthEntity, {
          where: {
            providerUserId: userDetails?.id,
            provider: AuthProvider.INTERNAL,
          },
        });

        if (alreadyInternalUser) {
          this.logger.error('EMAILS ALREADY EXISTS!');
          throw new ConflictException('Email already registered');
        }
        const userAuth = manager.create(UserAuthEntity, {
          provider: AuthProvider.INTERNAL,
          providerUserId: userDetails.id,
          user: userDetails,
          passwordHash: createUserDto.password,
        });
        await manager.save(userAuth);
        return userDetails;
      }

      const user = manager.create(UserEntity, {
        email: createUserDto.email,
        name: createUserDto.name,
      });
      await manager.save(UserEntity, user);
      const role = await manager.findOneOrFail(RoleEntity, {
        where: { role: ROLES.USER },
      });

      const userAuth = manager.create(UserAuthEntity, {
        provider: AuthProvider.INTERNAL,
        providerUserId: user.id,
        passwordHash: createUserDto.password,
        user,
      });

      await manager.save(userAuth);

      const userRole = manager.create(UserRolesEntity, {
        role,
        user,
      });

      await manager.save(userRole);

      return user;
    });
  }

  async createSocialAuthUser(
    createUserDto: Partial<CreateInternalUserDto>,
    userId: string,
  ) {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      this.logger.debug('Starting transaction for Adding external User');
      const isEmailPresent = await manager.findOne(UserAuthEntity, {
        where: {
          providerUserId: userId,
          provider: AuthProvider.EXTERNAL,
        },
      });

      if (isEmailPresent) {
        this.logger.verbose('Social User already exists in system!');
        return;
      }
      const user = manager.create(UserEntity, {
        email: createUserDto.email,
        name: createUserDto.name,
      });
      await manager.save(UserEntity, user);
      const role = await manager.findOneOrFail(RoleEntity, {
        where: { role: ROLES.USER },
      });

      const userAuth = manager.create(UserAuthEntity, {
        provider: AuthProvider.EXTERNAL,
        providerUserId: userId,
        user,
      });

      await manager.save(userAuth);

      const userRole = manager.create(UserRolesEntity, {
        role,
        user,
      });

      await manager.save(userRole);

      return user;
    });
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

  async findByMail(mail: string, isInternal: boolean) {
    const user = await this.userRepo.findOne({
      where: {
        email: mail,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    const authProvider = await this.authProviderRepo.findOne({
      where: {
        providerUserId: user.id,
        provider: isInternal ? AuthProvider.INTERNAL : AuthProvider.EXTERNAL,
      },
    });

    this.logger.verbose(`authProvider-> ${authProvider}`);

    const userRole = await this.userRolesRepo.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: {
        role: true,
      },
    });
    this.logger.verbose(`userRole-> ${userRole}`);

    const role = await this.roleRepo.findOne({
      where: {
        id: userRole?.role.id,
      },
    });
    this.logger.verbose(`role-> ${role}`);

    this.logger.verbose(
      `Fetched authProvider for ${isInternal ? AuthProvider.INTERNAL : AuthProvider.EXTERNAL} user ->`,
      authProvider,
    );

    return {
      ...user,
      password: authProvider?.passwordHash ?? '',
      role: userRole?.role.role,
    };
  }
}
