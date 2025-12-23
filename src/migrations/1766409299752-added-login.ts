import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedLogin1766409299752 implements MigrationInterface {
    name = 'AddedLogin1766409299752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying NOT NULL`);
    }

}
