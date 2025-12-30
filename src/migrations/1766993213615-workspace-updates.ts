import { MigrationInterface, QueryRunner } from "typeorm";

export class WorkspaceUpdates1766993213615 implements MigrationInterface {
    name = 'WorkspaceUpdates1766993213615'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workspaces" ADD "active" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workspaces" DROP COLUMN "active"`);
    }

}
