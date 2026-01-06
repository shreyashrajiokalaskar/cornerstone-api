import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../libs/common/src/entities/common.entity';
import { ChatEntity } from '../../chat/entities/chat.entity';
import { DocumentChunkEntity } from '../../documents/entities/document-chunk.entity';
import { DocumentEntity } from '../../documents/entities/document.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('workspaces')
export class WorkspaceEntity extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => UserEntity, (user) => user.workspaces)
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity;

  @Column()
  ownerId: string;

  @OneToMany(() => DocumentEntity, (docs) => docs.workspace)
  documents: DocumentEntity[];

  @Column({
    type: 'boolean',
    default: false,
  })
  active: boolean;

  @OneToMany(() => DocumentChunkEntity, (docChunk) => docChunk.workspace)
  documentChunks: DocumentChunkEntity[];

  @OneToMany(() => ChatEntity, (chat) => chat.workspace)
  chats: ChatEntity[];
}
