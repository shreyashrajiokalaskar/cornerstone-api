import { Column, Entity } from "typeorm";
import { BaseEntity, ROLES } from "../../../libs/common/src";

@Entity('roles')
export class RoleEntity extends BaseEntity {

    @Column({
        type: 'enum',
        enum: ROLES, // Replace with your actual roles
        nullable: false,
    })
    role: string;
}
