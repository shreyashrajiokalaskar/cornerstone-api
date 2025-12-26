import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateInternalUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @IsEmail({}, { message: 'Please check your email!' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Please check your password!' })
  password: string;
}
