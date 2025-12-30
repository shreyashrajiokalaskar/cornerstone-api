import { MigrationInterface, QueryRunner } from "typeorm";

export class MinorUpdates1767000691913 implements MigrationInterface {
    name = 'MinorUpdates1767000691913'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_auth_providers" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "documents" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "workspaces" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "deleted_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "deleted_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "documents" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "user_auth_providers" DROP COLUMN "deleted_at"`);
    }

}
