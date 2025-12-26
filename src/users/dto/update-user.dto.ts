import { PartialType } from '@nestjs/mapped-types';
import { CreateInternalUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateInternalUserDto) {}
