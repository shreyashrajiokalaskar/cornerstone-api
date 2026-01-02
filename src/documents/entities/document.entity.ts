import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity, DOC_STATUS } from '../../../libs/common/src/index';
import { WorkspaceEntity } from '../../workspaces/entities/workspace.entity';
import { DocumentChunkEntity } from './document-chunk.entity';

@Index(['workspaceId', 'key'], { unique: true })
@Entity('documents')
export class DocumentEntity extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  key: string;

  @Column({
    type: 'enum',
    enum: DOC_STATUS,
    default: DOC_STATUS.PENDING,
  })
  status: string;

  @Column({ type: 'bigint' })
  size: number; // bytes

  @Column({ length: 64 })
  checksum: string; // SHA-256

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.documents)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity;

  @Column()
  workspaceId: string;

  @OneToMany(() => DocumentChunkEntity, (docChunk) => docChunk.document)
  documentChunks: DocumentChunkEntity[];
}
