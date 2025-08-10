import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlayers1754756779720 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "players" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "username" varchar NOT NULL UNIQUE,
        "mu" double precision NOT NULL DEFAULT 25,
        "sigma" double precision NOT NULL DEFAULT (25.0/3.0),
        "rating" double precision NOT NULL DEFAULT (25.0 - 3.0*(25.0/3.0)),
        "wins" integer NOT NULL DEFAULT 0,
        "losses" integer NOT NULL DEFAULT 0,
        "draws" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_players_rating_desc"
      ON "players" ("rating" DESC);
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION set_timestamp_updatedAt() RETURNS trigger AS $$
      BEGIN
        NEW."updatedAt" = now();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trg_players_updatedAt ON "players";
      CREATE TRIGGER trg_players_updatedAt
      BEFORE UPDATE ON "players"
      FOR EACH ROW EXECUTE PROCEDURE set_timestamp_updatedAt();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
     await queryRunner.query(
       `DROP TRIGGER IF EXISTS trg_players_updatedAt ON "players";`,
     );
     await queryRunner.query(
       `DROP FUNCTION IF EXISTS set_timestamp_updatedAt;`,
     );
     await queryRunner.query(`DROP INDEX IF EXISTS "idx_players_rating_desc";`);
     await queryRunner.query(`DROP TABLE IF EXISTS "players";`);
  }
}
