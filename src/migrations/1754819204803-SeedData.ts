import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedData1754819204803 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    const rows = await queryRunner.query(`
      INSERT INTO "players" ("username")
      VALUES 
        ('ash'), ('misty'), ('brock'), ('gary')
      RETURNING id, username, mu, sigma, rating;
    `);

    const players = rows.reduce(
      (acc: any, r: any) => {
        acc[r.username] = r;
        return acc;
      },
      {} as Record<string, any>,
    );

    // --- ash vs misty. ash is winner
    const before1A = {
      mu: Number(players.ash.mu),
      sigma: Number(players.ash.sigma),
    };
    const before1B = {
      mu: Number(players.misty.mu),
      sigma: Number(players.misty.sigma),
    };
    const after1A = {
      mu: before1A.mu + 1.2,
      sigma: Math.max(before1A.sigma - 0.1, 0.0001),
    };
    const after1B = {
      mu: before1B.mu - 1.0,
      sigma: Math.max(before1B.sigma - 0.1, 0.0001),
    };

    const match1 = await queryRunner.query(
      `
      INSERT INTO "matches"
      ("playerAId","playerBId","scoreA","scoreB","isDraw","ratingsBefore","ratingsAfter")
      VALUES
      ($1::uuid,$2::uuid,$3::int,$4::int,$5::boolean,$6::jsonb,$7::jsonb)
      RETURNING id, "createdAt";
      `,
      [
        players.ash.id,
        players.misty.id,
        10,
        7,
        false,
        JSON.stringify({ a: before1A, b: before1B }),
        JSON.stringify({ a: after1A, b: after1B }),
      ],
    );

    const ratingA = after1A.mu - 3 * after1A.sigma;
    await queryRunner.query(
      `
        UPDATE "players"
        SET "wins"   = "wins" + 1,
            "mu"     = $2::double precision,
            "sigma"  = $3::double precision,
            "rating" = $4::double precision
        WHERE id     = $1::uuid;
        `,
      [players.ash.id, after1A.mu, after1A.sigma, ratingA],
    );

    const ratingB = after1B.mu - 3 * after1B.sigma;
    await queryRunner.query(
      `
      UPDATE "players"
      SET "losses" = "losses" + 1,
          "mu"     = $2::double precision,
          "sigma"  = $3::double precision,
          "rating" = $4::double precision
      WHERE id     = $1::uuid;
      `,
      [players.misty.id, after1B.mu, after1B.sigma, ratingB],
    );

    await queryRunner.query(
      `
      INSERT INTO "player_rating_history"
      ("playerId","matchId","muBefore","sigmaBefore","muAfter","sigmaAfter")
      VALUES
      ($1::uuid,$2::uuid,$3::double precision,$4::double precision,$5::double precision,$6::double precision),
      ($7::uuid,$2::uuid,$8::double precision,$9::double precision,$10::double precision,$11::double precision);
      `,
      [
        players.ash.id,
        match1[0].id,
        before1A.mu,
        before1A.sigma,
        after1A.mu,
        after1A.sigma,
        players.misty.id,
        before1B.mu,
        before1B.sigma,
        after1B.mu,
        after1B.sigma,
      ],
    );

    // --- brock vs gary. draw
    const before2A = {
      mu: Number(players.brock.mu),
      sigma: Number(players.brock.sigma),
    };
    const before2B = {
      mu: Number(players.gary.mu),
      sigma: Number(players.gary.sigma),
    };
    const after2A = {
      mu: before2A.mu + 0.1,
      sigma: Math.max(before2A.sigma - 0.05, 0.0001),
    };
    const after2B = {
      mu: before2B.mu + 0.1,
      sigma: Math.max(before2B.sigma - 0.05, 0.0001),
    };

    const match2 = await queryRunner.query(
      `
      INSERT INTO "matches"
      ("playerAId","playerBId","scoreA","scoreB","isDraw","ratingsBefore","ratingsAfter")
      VALUES
      ($1::uuid,$2::uuid,$3::int,$4::int,$5::boolean,$6::jsonb,$7::jsonb)
      RETURNING id, "createdAt";
      `,
      [
        players.brock.id,
        players.gary.id,
        8,
        8,
        true,
        JSON.stringify({ a: before2A, b: before2B }),
        JSON.stringify({ a: after2A, b: after2B }),
      ],
    );

    const rating2A = after2A.mu - 3 * after2A.sigma;
    await queryRunner.query(
      `
      UPDATE "players"
      SET "draws"  = "draws" + 1,
          "mu"     = $2::double precision,
          "sigma"  = $3::double precision,
          "rating" = $4::double precision
      WHERE id     = $1::uuid;
      `,
      [players.brock.id, after2A.mu, after2A.sigma, rating2A],
    );

    const rating2B = after2B.mu - 3 * after2B.sigma;
    await queryRunner.query(
      `
      UPDATE "players"
      SET "draws"  = "draws" + 1,
          "mu"     = $2::double precision,
          "sigma"  = $3::double precision,
          "rating" = $4::double precision
      WHERE id     = $1::uuid;
      `,
      [players.gary.id, after2B.mu, after2B.sigma, rating2B],
    );

    await queryRunner.query(
      `
      INSERT INTO "player_rating_history"
      ("playerId","matchId","muBefore","sigmaBefore","muAfter","sigmaAfter")
      VALUES
      ($1::uuid,$2::uuid,$3::double precision,$4::double precision,$5::double precision,$6::double precision),
      ($7::uuid,$2::uuid,$8::double precision,$9::double precision,$10::double precision,$11::double precision);
      `,
      [
        players.brock.id,
        match2[0].id,
        before2A.mu,
        before2A.sigma,
        after2A.mu,
        after2A.sigma,
        players.gary.id,
        before2B.mu,
        before2B.sigma,
        after2B.mu,
        after2B.sigma,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "player_rating_history";`);
    await queryRunner.query(`DELETE FROM "matches";`);
    await queryRunner.query(`DELETE FROM "players"`);
  }
}
