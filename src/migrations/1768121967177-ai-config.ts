import { MigrationInterface, QueryRunner } from "typeorm";

export class AiConfig1768121967177 implements MigrationInterface {
    name = 'AiConfig1768121967177'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workspaces" ADD "temperature" double precision NOT NULL DEFAULT '0.7'`);
        await queryRunner.query(`ALTER TABLE "workspaces" ADD "systemPrompt" text NOT NULL DEFAULT 'Answer using only the context provided. Cite them like [1], [2]. If the context does not contain the answer, respond with "I do not know."'`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "role" SET DEFAULT 'user'`);
        await queryRunner.query(`ALTER TYPE "public"."roles_role_enum" RENAME TO "roles_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."roles_role_enum" AS ENUM('ADMIN', 'USER', 'ASSISTANT')`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "role" TYPE "public"."roles_role_enum" USING "role"::"text"::"public"."roles_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."roles_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."roles_role_enum_old" AS ENUM('ADMIN', 'USER')`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "role" TYPE "public"."roles_role_enum_old" USING "role"::"text"::"public"."roles_role_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."roles_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."roles_role_enum_old" RENAME TO "roles_role_enum"`);
        await queryRunner.query(`ALTER TABLE "messages" ALTER COLUMN "role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "systemPrompt"`);
        await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "temperature"`);
    }

}
