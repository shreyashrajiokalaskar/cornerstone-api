import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../libs/common/src/index';
import { DocumentChunkEntity } from '../../documents/entities/document-chunk.entity';
import { MessageEntity } from './message.entity';

@Entity('message_chunks')
export class MessageChunkEntity extends BaseEntity {
  @ManyToOne(() => MessageEntity, (message) => message.chunks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'messageId' })
  message: MessageEntity;

  @Column()
  messageId: string;

  @ManyToOne(() => DocumentChunkEntity, (chunk) => chunk.messageChunk, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chunkId' })
  chunk: DocumentChunkEntity;

  @Column()
  chunkId: string;
}
