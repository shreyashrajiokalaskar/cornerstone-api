import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';


@Injectable()
export class AuthService {

    constructor(private userService: UsersService, private jwtService: JwtService) { }

    async loginUser(loginDto: LoginDto) {
        try {
            const user = await this.userService.findByMail(loginDto.email);
            console.log(loginDto.password, 'user.password', user.password)
            const isPasswordCorrect = this.checkPassword(loginDto.password, user.password);
            console.log('isPasswordCorrect', isPasswordCorrect)
            if (!isPasswordCorrect) {
                throw new BadRequestException("Wrong Password!")
            };
            const payload = { sub: user.id, email: user.email };
            return {
                email: user.email,
                token: await this.jwtService.signAsync(payload, {
                    secret: process.env['JWT_SECRET']
                }),
            };
        } catch (error) {
            console.log("ERROR", error)
        }
    }

    async createInternalUser(createUserDto: CreateUserDto) {
        const { password } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 11);
        const user = this.userService.createInternalUser({
            ...createUserDto,
            password: hashedPassword,
        });
        return user;
    }

    async hashPassword(password: string) {
        return await bcrypt.hash(password, 12)
    }

    checkPassword(password: string, passwordHash: string): boolean {
        return bcrypt.compareSync(password, passwordHash)
    }
}
