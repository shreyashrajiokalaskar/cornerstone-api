import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../libs/common/src';
import { UserAuthEntity } from '../../auth/entities/user-auth.entity';
import { WorkspaceEntity } from '../../workspaces/entities/workspace.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => UserAuthEntity, (auth) => auth.user)
  authProviders: UserAuthEntity[];

  @OneToMany(() => WorkspaceEntity, (workspace) => workspace.owner)
  workspaces: WorkspaceEntity[];
}
