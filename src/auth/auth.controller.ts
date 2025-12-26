import { Public } from '@app/common';
import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { CreateInternalUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.verbose('Calling LOGIN from controller');
    return await this.authService.loginUser(loginDto);
  }

  @Public()
  @Post('signup')
  async signup(@Body() createUserDto: CreateInternalUserDto) {
    return await this.authService.createInternalUser(createUserDto);
  }

  @Public()
  @Get('google-login')
  async googleLogin() {
    this.logger.verbose('Calling GOOGLE LOGIN from controller');
    return await this.authService.googleLogin();
  }

  @Public()
  @Get('google-verify')
  async googleAuthCallback(
    @Query('code') code: string,
    @Query('state') state: string,
  ): Promise<any> {
    this.logger.verbose('Calling googleAuthCallback() from Auth controller');
    return await this.authService.getAuthClientData(code, state);
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    this.logger.verbose(
      'Calling refreshToken() from Auth Controller with value',
      refreshToken,
    );
    return this.authService.refreshToken(refreshToken);
  }

  @Public()
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    await this.authService.logout(refreshToken);
  }
}
