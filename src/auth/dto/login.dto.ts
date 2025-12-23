import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {

    @IsString()
    @IsEmail({}, { message: 'Please check your email!' })
    email: string;

    @IsString()
    @MinLength(8, { message: "Please check your password!" })
    password: string
}
