import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('document_vectors')
export class DocumentVectorEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;


    @Column()
    documentId: string;

    @Column()
    workspaceId: string;

    @Column('text')
    content: string;

    @Column({
        type: 'vector',
        length: 1536,
        nullable: false,
    })
    embedding: number[]

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt?: Date;
}
