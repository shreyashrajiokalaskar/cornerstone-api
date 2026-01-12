import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../libs/common/src/index';

@Entity('invites')
export class InviteEntity extends BaseEntity {
  @Column()
  email: string;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({
    type: 'timestamp',
  })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;
}
