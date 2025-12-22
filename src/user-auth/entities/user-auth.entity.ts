import { Column, Entity, ManyToOne, OneToMany, Unique } from "typeorm";
import { AuthProvider } from "../../../libs/common/src";
import { BaseEntity } from "../../../libs/common/src/index";
import { RoleEntity } from "../../roles/entities/role.entity";
import { UserRolesEntity } from "../../users/entities/user-role.entity";
import { User } from "../../users/entities/user.entity";

@Entity('user_auth_providers')
@Unique(['provider', 'providerUserId'])
export class UserAuthEntity extends BaseEntity {

    @Column({
        type: 'enum',
        enum: AuthProvider
    })
    provider: AuthProvider;

    @Column()
    providerUserId: string;

    @Column({ nullable: true })
    passwordHash?: string;

    @ManyToOne(() => User, (user) => user.authProviders, { cascade: true })
    user: User;

    @OneToMany(() => UserRolesEntity, (user) => user.user)
    roles: RoleEntity[];
}
