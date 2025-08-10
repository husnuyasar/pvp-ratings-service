import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMatches1754819027379 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "matches" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "playerAId" uuid NOT NULL,
        "playerBId" uuid NOT NULL,
        "scoreA" integer NOT NULL,
        "scoreB" integer NOT NULL,
        "isDraw" boolean NOT NULL DEFAULT false,
        "ratingsBefore" jsonb NOT NULL,
        "ratingsAfter" jsonb NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_matches_playerA" FOREIGN KEY ("playerAId") REFERENCES "players"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_matches_playerB" FOREIGN KEY ("playerBId") REFERENCES "players"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_matches_player_a_created_at"
      ON "matches" ("playerAId", "createdAt" DESC);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_matches_player_b_created_at"
      ON "matches" ("playerBId", "createdAt" DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
     await queryRunner.query(
       `DROP INDEX IF EXISTS "idx_matches_player_b_created_at";`,
     );
     await queryRunner.query(
       `DROP INDEX IF EXISTS "idx_matches_player_a_created_at";`,
     );
     await queryRunner.query(`DROP TABLE IF EXISTS "matches";`);
  }
}
