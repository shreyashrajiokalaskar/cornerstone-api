import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../libs/common/src/entities/common.entity';
import { WorkspaceEntity } from '../../workspaces/entities/workspace.entity';
import { DocumentEntity } from './document.entity';

@Entity('document_chunks')
export class DocumentChunkEntity extends BaseEntity {
  @Column({
    type: 'text',
  })
  content: string;

  @Column({
    type: 'vector',
    transformer: {
      to: (v: number[]) => `[${v.join(',')}]`,
      from: (v: string) => v.slice(1, -1).split(',').map(Number),
    },
    length: 1536,
  })
  embedding: number[];

  @ManyToOne(() => DocumentEntity, (document) => document.documentChunks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'documentId' })
  document: DocumentEntity;

  @Index()
  @Column()
  documentId: string;

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.documentChunks)
  @JoinColumn({ name: 'workspaceId' })
  workspace: WorkspaceEntity; // We keep this here to make searching faster!

  @Column()
  @Index()
  workspaceId: string;
}
