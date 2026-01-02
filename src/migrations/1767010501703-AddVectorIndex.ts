import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVectorIndex1767010501703 implements MigrationInterface {
    name = 'AddVectorIndex1767010501703';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE INDEX document_chunks_embedding_hnsw
      ON document_chunks
      USING hnsw (embedding vector_cosine_ops);
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      CREATE INDEX idx_document_chunks_embedding
      ON document_chunks
      USING ivfflat (embedding vector_cosine_ops);
    `);
    }
}
