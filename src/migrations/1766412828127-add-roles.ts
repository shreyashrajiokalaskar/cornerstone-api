import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoles1766412828127 implements MigrationInterface {
  name?: string | undefined = 'AddRoles1766412828127';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO roles (role)
            VALUES ('USER'), ('ADMIN')
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DELETE FROM roles
          WHERE role IN ('USER', 'ADMIN')
        `);
  }
}
