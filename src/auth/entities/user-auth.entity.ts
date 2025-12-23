import { Column, Entity, ManyToOne, Unique } from "typeorm";
import { AuthProvider } from "../../../libs/common/src";
import { BaseEntity } from "../../../libs/common/src/index";
import { UserEntity } from "../../users/entities/user.entity";

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

    @ManyToOne(() => UserEntity, (user) => user.authProviders, { cascade: true })
    user: UserEntity;
}
