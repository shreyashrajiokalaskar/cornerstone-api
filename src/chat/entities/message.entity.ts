import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../libs/common/src/index';
import { CHAT_ROLES } from '../common.constant';
import { ChatEntity } from '../entities/chat.entity';
import { MessageChunkEntity } from './message-chunk.entity';

@Entity('messages')
export class MessageEntity extends BaseEntity {
  @Column({
    enum: CHAT_ROLES,
    default: CHAT_ROLES.user,
  })
  role: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => ChatEntity, (chat) => chat.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chatId' })
  chat: ChatEntity;

  @Column()
  chatId: string;

  @OneToMany(() => MessageChunkEntity, (messageSource) => messageSource.message)
  chunks: MessageChunkEntity[];
}
