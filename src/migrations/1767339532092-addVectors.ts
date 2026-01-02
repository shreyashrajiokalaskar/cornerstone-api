import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVectors1767339532092 implements MigrationInterface {
    name = 'AddVectors1767339532092'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_document_chunks_embedding"`);
        await queryRunner.query(`CREATE TABLE "document_vectors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "documentId" character varying NOT NULL, "workspaceId" character varying NOT NULL, "content" text NOT NULL, "embedding" vector(1536) NOT NULL, CONSTRAINT "PK_5c5c04082d098e9f6f59f4146a5" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "document_vectors"`);
        await queryRunner.query(`CREATE INDEX "idx_document_chunks_embedding" ON "document_chunks" ("embedding") `);
    }

}
