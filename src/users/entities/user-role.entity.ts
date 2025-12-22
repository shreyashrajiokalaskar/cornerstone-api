import { CreateDateColumn, Entity, ManyToOne, Unique } from "typeorm";
import { BaseEntity } from '../../../libs/common/src';
import { RoleEntity } from "../../roles/entities/role.entity";
import { User } from "./user.entity";

@Entity('user_roles')
@Unique(['user', 'role'])
export class UserRolesEntity extends BaseEntity {

    @ManyToOne(() => User, (user) => user.id, { cascade: true })
    user: User;

    @ManyToOne(() => RoleEntity)
    role: RoleEntity;

    @CreateDateColumn()
    assignedAt: Date;

}
