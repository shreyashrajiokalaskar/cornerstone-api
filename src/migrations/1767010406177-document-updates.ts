import { MigrationInterface, QueryRunner } from "typeorm";

export class DocumentUpdates1767010406177 implements MigrationInterface {
    name = 'DocumentUpdates1767010406177'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document_chunks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "content" text NOT NULL, "embedding" vector(1536) NOT NULL, "documentId" uuid NOT NULL, "workspaceId" uuid NOT NULL, CONSTRAINT "PK_7f9060084e9b872dbb567193978" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_eaf9afaf30fb7e2ac25989db51" ON "document_chunks" ("documentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_dc25084134ee6f3a78abc9c303" ON "document_chunks" ("workspaceId") `);
        await queryRunner.query(`ALTER TABLE "documents" ADD "size" bigint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "checksum" character varying(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "document_chunks" ADD CONSTRAINT "FK_eaf9afaf30fb7e2ac25989db51b" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_chunks" ADD CONSTRAINT "FK_dc25084134ee6f3a78abc9c3033" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_chunks" DROP CONSTRAINT "FK_dc25084134ee6f3a78abc9c3033"`);
        await queryRunner.query(`ALTER TABLE "document_chunks" DROP CONSTRAINT "FK_eaf9afaf30fb7e2ac25989db51b"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "checksum"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "size"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dc25084134ee6f3a78abc9c303"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_eaf9afaf30fb7e2ac25989db51"`);
        await queryRunner.query(`DROP TABLE "document_chunks"`);
    }

}
