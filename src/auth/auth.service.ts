import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from 'src/redis/redis.service';
import { CreateInternalUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import {
  checkPassword,
  generateRefreshToken,
  hashPassword,
} from './auth.config';
import { LoginDto } from './dto/login.dto';
import { GoogleAuthService } from './services/google-auth.service';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private googleService: GoogleAuthService,
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async loginUser(loginDto: LoginDto) {
    const user = await this.userService.findByMail(loginDto.email, true);
    const isPasswordCorrect = checkPassword(loginDto.password, user.password);
    if (!isPasswordCorrect) {
      throw new BadRequestException('Wrong Password!');
    }
    const payload = { id: user.id, email: user.email };
    const refreshToken = generateRefreshToken();
    await this.redisService.set(`refresh:${refreshToken}`, payload, 2592000);
    return {
      email: user.email,
      token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
      }),
      refreshToken,
      name: user.name,
      role: user.role,
    };
  }

  async createInternalUser(createUserDto: CreateInternalUserDto) {
    const { password } = createUserDto;
    const hashedPassword = await hashPassword(password);
    const user = this.userService.createInternalUser({
      ...createUserDto,
      password: hashedPassword,
    });
    return user;
  }

  async googleLogin() {
    this.logger.verbose('Calling getOAuth2ClientUrl() from Auth Service');
    const data = await this.googleService.getOAuth2ClientUrl();
    await this.redisService.set(
      `oauth:state:${data.state}`,
      { url: data.url },
      300,
    );
    return data;
  }

  async getAuthClientData(code: string, state: string) {
    const findState = await this.redisService.get(`oauth:state:${state}`);
    this.logger.verbose('Finding State Info From Redis', findState);
    if (!findState) {
      throw new UnauthorizedException();
    }
    this.logger.verbose('State Found and removing from Redis Now');
    await this.redisService.del(`oauth:state:${state}`);
    const {
      email,
      googleId,
      name,
      image = '',
    } = await this.googleService.verifyGoogleCode(code);
    this.logger.verbose('Calling verifyGoogleCode() from Auth Service', {
      email,
      name,
      image,
    });
    const refreshToken = generateRefreshToken();
    const payload = { id: googleId, email: email };

    await this.redisService.set(`refresh:${refreshToken}`, payload, 2592000);
    this.logger.verbose('Saving user to DB');
    await this.userService.createSocialAuthUser(
      {
        email,
        name,
      },
      googleId,
    );
    return {
      email: email,
      token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
      }),
      name,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    this.logger.verbose(
      'Extracted access token from Request as ',
      refreshToken,
    );
    const user: { id: string; email: string } | null =
      await this.redisService.get(`refresh:${refreshToken}`);
    this.logger.verbose('Fetched user details from Redis ->', user);
    if (!user) {
      throw new UnauthorizedException();
    }
    this.logger.verbose('Fetched user details from Redis ->', user);
    await this.redisService.del(`refresh:${refreshToken}`);
    const newRefreshToken = generateRefreshToken();
    const payload = { id: user.id as string, email: user.email };

    await this.redisService.set(`refresh:${refreshToken}`, payload, 2592000);
    return {
      token: await this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
      }),
      refreshToken: newRefreshToken,
    };
  }

  async logout(refreshToken: string) {
    this.logger.verbose('Logging user ->', refreshToken);
    await this.redisService.del(`refresh:${refreshToken}`);
  }
}
