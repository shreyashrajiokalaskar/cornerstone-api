import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../libs/common/src';
import { UserAuthEntity } from '../../user-auth/entities/user-auth.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => UserAuthEntity, (auth) => auth.user)
  authProviders: UserAuthEntity[];
}
