import { MigrationInterface, QueryRunner } from "typeorm";

export class CascadeChanges1767352406993 implements MigrationInterface {
    name = 'CascadeChanges1767352406993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "document_chunks" DROP CONSTRAINT "FK_eaf9afaf30fb7e2ac25989db51b"`);
        await queryRunner.query(`ALTER TABLE "user_auth_providers" DROP CONSTRAINT "FK_344bc2c598846ecf8f58274fdaa"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`);
        await queryRunner.query(`DROP INDEX "public"."document_chunks_embedding_hnsw"`);
        await queryRunner.query(`ALTER TABLE "document_chunks" ADD CONSTRAINT "FK_eaf9afaf30fb7e2ac25989db51b" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_auth_providers" ADD CONSTRAINT "FK_344bc2c598846ecf8f58274fdaa" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`);
        await queryRunner.query(`ALTER TABLE "user_auth_providers" DROP CONSTRAINT "FK_344bc2c598846ecf8f58274fdaa"`);
        await queryRunner.query(`ALTER TABLE "document_chunks" DROP CONSTRAINT "FK_eaf9afaf30fb7e2ac25989db51b"`);
        await queryRunner.query(`CREATE INDEX "document_chunks_embedding_hnsw" ON "document_chunks" ("embedding") `);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_auth_providers" ADD CONSTRAINT "FK_344bc2c598846ecf8f58274fdaa" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "document_chunks" ADD CONSTRAINT "FK_eaf9afaf30fb7e2ac25989db51b" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
