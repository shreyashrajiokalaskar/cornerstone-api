import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedUser1767602891578 implements MigrationInterface {
    name = 'UpdatedUser1767602891578'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chats" ADD "title" text`);
        await queryRunner.query(`ALTER TABLE "chats" ADD CONSTRAINT "FK_ae8951c0a763a060593606b7e2d" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats" DROP CONSTRAINT "FK_ae8951c0a763a060593606b7e2d"`);
        await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "chats" DROP COLUMN "userId"`);
    }

}
