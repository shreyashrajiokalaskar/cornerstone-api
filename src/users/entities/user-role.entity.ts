import { CreateDateColumn, Entity, ManyToOne, Unique } from "typeorm";
import { BaseEntity } from '../../../libs/common/src';
import { RoleEntity } from "../../roles/entities/role.entity";
import { UserEntity } from "./user.entity";

@Entity('user_roles')
@Unique(['user', 'role'])
export class UserRolesEntity extends BaseEntity {

    @ManyToOne(() => UserEntity, (user) => user.id, { cascade: true })
    user: UserEntity;

    @ManyToOne(() => RoleEntity)
    role: RoleEntity;

    @CreateDateColumn()
    assignedAt: Date;

}
