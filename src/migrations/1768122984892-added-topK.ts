import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedTopK1768122984892 implements MigrationInterface {
    name = 'AddedTopK1768122984892'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workspaces" ADD "topK" integer NOT NULL DEFAULT '5'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "topK"`);
    }

}
