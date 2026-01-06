import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../libs/common/src/index';
import { UserEntity } from '../../users/entities/user.entity';
import { WorkspaceEntity } from '../../workspaces/entities/workspace.entity';
import { MessageEntity } from './message.entity';

@Entity('chats')
export class ChatEntity extends BaseEntity {
  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.chats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column()
  workspaceId: string;

  @OneToMany(() => MessageEntity, (message) => message.chat)
  messages: MessageEntity[];

  @ManyToOne(() => UserEntity, (user) => user.chats, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;

  @Column({ type: 'text', nullable: true })
  title: string;
}
