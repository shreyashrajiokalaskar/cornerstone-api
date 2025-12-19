import { BaseEnity } from '../../../libs/common/src';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class User extends BaseEnity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
