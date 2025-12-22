import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
  async create(createUserDto: CreateUserDto) {
    const { password } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 11);
    const user = this.userRepo.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepo.save(user);
    return {
      id: savedUser.id,
      email: savedUser.email,
      name: savedUser.name,
      createdAt: savedUser.createdAt,
    };
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
}
