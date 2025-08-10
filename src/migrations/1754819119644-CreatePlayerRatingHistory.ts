import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlayerRatingHistory1754819119644
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "player_rating_history" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "playerId" uuid NOT NULL,
        "matchId" uuid NOT NULL,
        "muBefore" double precision NOT NULL,
        "sigmaBefore" double precision NOT NULL,
        "muAfter" double precision NOT NULL,
        "sigmaAfter" double precision NOT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_prh_player" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_prh_match" FOREIGN KEY ("matchId") REFERENCES "matches"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_prh_player_created_at"
      ON "player_rating_history" ("playerId", "createdAt" DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "idx_prh_player_created_at";`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "player_rating_history";`);
  }
}
