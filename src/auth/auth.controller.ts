import { Public } from '@app/common';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.loginUser(loginDto);
  }

  @Public()
  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createInternalUser(createUserDto);
  }

  @Public()
  @Get('google-login')
  async googleLogin() {
    return await this.authService.googleLogin();
  }

  @Public()
  @Get('google-verify')
  async googleAuthCallback(@Query('code') code: string): Promise<any> {
    return await this.authService.getAuthClientData(code);
    // console.log('userDetails', email, refreshToken, accessToken);
    // // Implement additional sign-in logic here
    // return { url: 'shreyash-kalaskar.online' };
  }
}
