import {
    BadGatewayException,
  HttpException,
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateMatchDto } from './dto/create-match.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Match } from '../entities/match.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Player } from '../entities/player.entity';
import { RatingService } from '../rating/rating.service';
import { PlayerRatingHistory } from '../entities/player-rating-history.entity';

@Injectable()
export class MatchService {
  private readonly DUP_WINDOW_SECONDS = 5;

  constructor(
    @InjectRepository(Match) private readonly matchRepo: Repository<Match>,
    private readonly dataSource: DataSource,
    private readonly ratingService: RatingService,
  ) {}

  async create(dto: CreateMatchDto) {
    const { playerAId, playerBId, scoreA, scoreB } = dto;

    if (playerAId === playerBId)
      throw new UnprocessableEntityException('Players must be different');

    const isDraw = scoreA === scoreB;
    const outcome = isDraw ? 'D' : scoreA > scoreB ? 'A' : 'B';

    try {
      return this.dataSource.transaction(async (manager) => {
        const [minId, maxId] = [playerAId, playerBId].sort();

        // advisory lock to prevent other same requests
        const [{ locked }] = await manager.query(
          `
        SELECT pg_try_advisory_xact_lock(
            hashtextextended(
            'match:' ||
            LEAST($1::uuid, $2::uuid)::text || '|' || GREATEST($1::uuid, $2::uuid)::text,
            0
            )
        ) AS locked
         `,
          [minId, maxId],
        );
        if (!locked)
          throw new UnprocessableEntityException('The match is in progress!');

        const lockedPlayers = await manager
          .createQueryBuilder(Player, 'p')
          .where('p.id IN (:...ids)', { ids: [minId, maxId] })
          .setLock('pessimistic_write')
          .orderBy('p.id', 'ASC')
          .getMany();

        const playerA = lockedPlayers.find((p) => p.id === playerAId);
        const playerB = lockedPlayers.find((p) => p.id === playerBId);

        if (!playerA || !playerB)
          throw new UnprocessableEntityException('Players not found');

        const since = new Date(Date.now() - this.DUP_WINDOW_SECONDS * 1000);
        const existingMatch = await manager
          .getRepository(Match)
          .createQueryBuilder('m')
          .leftJoin('m.playerA', 'pa')
          .leftJoin('m.playerB', 'pb')
          .where('m.createdAt >= :since', { since })
          .andWhere(
            `(
        (pa.id =:aId AND pb.id =:bId AND m.scoreA =:scoreA AND m.scoreB =:scoreB) OR
        (pa.id =:bId AND pb.id =:aId AND m.scoreA =:scoreB AND m.scoreB =:scoreA)
            )`,
            {
              aId: playerAId,
              bId: playerBId,
              scoreA: scoreA,
              scoreB: scoreB,
            },
          )
          .andWhere('m.isDraw =:isDraw', { isDraw })
          .orderBy('m.createdAt', 'DESC')
          .getOne();

        if (existingMatch) return existingMatch;

        let computeResult: any;
        try {
          computeResult = await this.ratingService.computePlayers({
            aMu: playerA.mu,
            aSigma: playerA.sigma,
            bMu: playerB.mu,
            bSigma: playerB.sigma,
            outcome,
          });
        } catch {
          throw new BadGatewayException('Rating service failed');
        }

        const ratingsBefore = {
          a: { mu: playerA.mu, sigma: playerA.sigma },
          b: { mu: playerB.mu, sigma: playerB.sigma },
        };
        const ratingsAfter = {
          a: {
            mu: computeResult.aAfter.mu,
            sigma: computeResult.aAfter.sigma,
          },
          b: {
            mu: computeResult.bAfter.mu,
            sigma: computeResult.bAfter.sigma,
          },
        };

        if (outcome === 'D') {
          playerA.draws++;
          playerB.draws++;
        } else if (outcome === 'A') {
          playerA.wins++;
          playerB.losses++;
        } else {
          playerA.losses++;
          playerB.wins++;
        }

        playerA.mu = computeResult.aAfter.mu;
        playerA.sigma = computeResult.aAfter.sigma;
        playerA.rating = computeResult.aScore;

        playerB.mu = computeResult.bAfter.mu;
        playerB.sigma = computeResult.bAfter.sigma;
        playerB.rating = computeResult.bScore;

        await manager.getRepository(Player).save([playerA, playerB]);

        const match = manager.getRepository(Match).create({
          playerA,
          playerB,
          isDraw,
          scoreA,
          scoreB,
          ratingsAfter,
          ratingsBefore,
        });
        const saved = await manager.getRepository(Match).save(match);
        const playerRatingHistoryRepository =
          manager.getRepository(PlayerRatingHistory);
        await playerRatingHistoryRepository.save([
          playerRatingHistoryRepository.create({
            match: saved,
            player: playerA,
            muBefore: ratingsBefore.a.mu,
            sigmaBefore: ratingsBefore.a.sigma,
            muAfter: ratingsAfter.a.mu,
            sigmaAfter: ratingsAfter.a.sigma,
          }),
          playerRatingHistoryRepository.create({
            match: saved,
            player: playerB,
            muBefore: ratingsBefore.b.mu,
            sigmaBefore: ratingsBefore.b.sigma,
            muAfter: ratingsAfter.b.mu,
            sigmaAfter: ratingsAfter.b.sigma,
          }),
        ]);
        return saved;
      });
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
