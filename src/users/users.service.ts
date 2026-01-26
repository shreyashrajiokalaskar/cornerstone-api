import { AuthProvider, generateToken, getHashToken, ROLES } from '@app/common';
import { SesService } from '@app/common/services/aws/ses.service';
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
import { InviteEntity } from './entities/invite.entity';
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
    @InjectRepository(InviteEntity)
    private inviteRepo: Repository<InviteEntity>,
    private sesService: SesService,
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
    this.logger.log('findAll users called');
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
      this.logger.warn('USER NOT FOUND!', id);
      throw new NotFoundException('User not Found!');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    this.logger.log('update user called', { id, payload: updateUserDto });
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
    this.logger.verbose(`userRole-> ${userRole?.role.role}`);

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

  async inviteAdmin(email: string) {
    const user = await this.userRolesRepo.findOne({
      where: {
        user: {
          email,
        },
      },
    });

    if (user && user.role.role === ROLES.ADMIN) {
      throw new ConflictException('User with this email already exists');
    }

    const token = generateToken();

    this.logger.verbose(
      `Generated invite token for admin invitation -> ${token}`,
    );

    const invite = this.inviteRepo.create({
      email,
      tokenHash: getHashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    await this.inviteRepo.save(invite);
    await this.sesService.sendInviteEmail(email, token);
  }

  async verifyInvite(token: string) {
    this.logger.log(`Verifying invite token -> ${token}`);
    const tokenHash = getHashToken(token);
    this.logger.log(`Verifying tokenHash token -> ${tokenHash}`);

    const invite = await this.inviteRepo.findOne({
      where: {
        tokenHash,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invalid invite token');
    }

    if (invite.expiresAt < new Date()) {
      throw new ConflictException('Invite token has expired');
    }

    return { email: invite.email };
  }

  async findOneByInviteToken(token: string) {
    const tokenHash = getHashToken(token);
    const invite = await this.inviteRepo.findOne({
      where: {
        tokenHash,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invalid invite token');
    }
    return invite;
  }

  async createAdminUser(adminDetails: CreateInternalUserDto) {
    await this.dataSource.transaction(async (manager: EntityManager) => {});
    const user = await this.userRepo.findOne({
      where: {
        email: adminDetails.email,
      },
    });
    if (user) {
      const role = await this.userRolesRepo.findOne({
        where: {
          user: {
            id: user?.id,
          },
        },
      });
      if (role?.role.role === ROLES.ADMIN) {
        throw new ConflictException('Admin with this email already exists');
      }
    }

    const admin = this.userRepo.create({
      email: adminDetails.email,
      name: adminDetails.name,
    });
    await this.userRepo.save(admin);

    const adminAuth = this.authProviderRepo.create({
      providerUserId: admin.id,
      provider: AuthProvider.INTERNAL,
      passwordHash: adminDetails.password,
      user: admin,
    });

    await this.authProviderRepo.save(adminAuth);

    const adminRole = await this.roleRepo.findOne({
      where: {
        role: ROLES.ADMIN,
      },
    });

    const userRole = this.userRolesRepo.create({
      user: admin,
      role: adminRole as RoleEntity,
    });
    await this.userRolesRepo.save(userRole);
    await this.inviteRepo.delete({ email: adminDetails.email });
    return admin;
  }
}
