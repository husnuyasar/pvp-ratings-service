import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpException,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { MatchService } from './match.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { Match } from '../entities/match.entity';
import { Player } from '../entities/player.entity';
import { PlayerRatingHistory } from '../entities/player-rating-history.entity';
import { RatingService } from '../rating/rating.service';

type QB<T> = {
  where: jest.MockedFunction<any>;
  leftJoin?: jest.MockedFunction<any>;
  andWhere: jest.MockedFunction<any>;
  setLock?: jest.MockedFunction<any>;
  orderBy: jest.MockedFunction<any>;
  getMany?: jest.MockedFunction<any>;
  getOne?: jest.MockedFunction<any>;
};

describe('MatchService', () => {
  let service: MatchService;
  let dataSource: DataSource;
  let ratingService: RatingService;


  const playerAId = '550e8400-e29b-41d4-a716-446655440000';
  const playerBId = '550e8400-e29b-41d4-a716-446655440001';

  const basePlayerA = () =>
    ({
      id: playerAId,
      mu: 25,
      sigma: 8.3333,
      rating: 1500,
      wins: 0,
      losses: 0,
      draws: 0,
    }) as any as Player;

  const basePlayerB = () =>
    ({
      id: playerBId,
      mu: 25,
      sigma: 8.3333,
      rating: 1500,
      wins: 0,
      losses: 0,
      draws: 0,
    }) as any as Player;

  const dto = (a = 3, b = 2): CreateMatchDto => ({
    playerAId,
    playerBId,
    scoreA: a,
    scoreB: b,
  });

  const buildManager = (opts: {
    advisoryLocked?: boolean;
    players?: Player[];
    existingMatch?: Match | null;
    savePlayerSpy?: jest.Mock;
    saveMatchSpy?: jest.Mock;
    savePRHSpy?: jest.Mock;
  }) => {
    const {
      advisoryLocked = true,
      players = [basePlayerA(), basePlayerB()],
      existingMatch = null,
      savePlayerSpy = jest.fn().mockResolvedValue(undefined),
      saveMatchSpy = jest.fn((m: any) =>
        Promise.resolve({ id: 'match-1', ...m }),
      ),
      savePRHSpy = jest.fn().mockResolvedValue(undefined),
    } = opts;

    const playersQB: QB<Player> = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(players),
    };

    const matchQB: QB<Match> = {
      where: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(existingMatch),
    };

    const repos = new Map<any, any>();

    repos.set(Player, {
      save: savePlayerSpy,
    });

    repos.set(Match, {
      create: jest.fn((m: any) => m),
      save: saveMatchSpy,
      createQueryBuilder: jest.fn(() => matchQB),
    });

    repos.set(PlayerRatingHistory, {
      create: jest.fn((p: any) => p),
      save: savePRHSpy,
    });

    const manager: any = {

      query: jest.fn().mockResolvedValue([{ locked: advisoryLocked }]),
      createQueryBuilder: jest.fn((entityOrAlias: any, alias?: string) => {
        if (alias === 'p') return playersQB;
        return playersQB;
      }),
      getRepository: jest.fn((entity: any) => repos.get(entity)),
    };

    return {
      manager,
      playersQB,
      matchQB,
      repos,
      savePlayerSpy,
      saveMatchSpy,
      savePRHSpy,
    };
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    const mockDataSource = { transaction: jest.fn() } as unknown as DataSource;
    const mockRatingService = {
      computePlayers: jest.fn(),
    } as unknown as RatingService;
    const mockMatchRepo = {
      find: jest.fn(),
    }; 

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchService,
        { provide: getRepositoryToken(Match), useValue: mockMatchRepo },
        { provide: DataSource, useValue: mockDataSource },
        { provide: RatingService, useValue: mockRatingService },
      ],
    }).compile();

    service = module.get<MatchService>(MatchService);
    dataSource = module.get<DataSource>(DataSource);
    ratingService = module.get<RatingService>(RatingService);
  });

  it('throws 422 if playerAId === playerBId', async () => {
    await expect(
      service.create({ playerAId, playerBId: playerAId, scoreA: 1, scoreB: 0 }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('throws 422 if advisory lock is not acquired', async () => {
    const { manager } = buildManager({ advisoryLocked: false });
    (dataSource.transaction as any) = jest.fn(async (cb: any) => cb(manager));

    await expect(service.create(dto())).rejects.toBeInstanceOf(HttpException);
    await expect(service.create(dto())).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'The match is in progress!',
    });
  });

  it('throws 422 if players not found', async () => {
    const onlyOnePlayer = [basePlayerA()];
    const { manager } = buildManager({ players: onlyOnePlayer });
    (dataSource.transaction as any) = jest.fn(async (cb: any) => cb(manager));

    await expect(service.create(dto())).rejects.toBeInstanceOf(HttpException);
    await expect(service.create(dto())).rejects.toMatchObject({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      message: 'Players not found',
    });
  });

  it('returns existing match if duplicate in window', async () => {
    const existing = { id: 'existing-match' } as any as Match;
    const { manager } = buildManager({ existingMatch: existing });
    (dataSource.transaction as any) = jest.fn(async (cb: any) => cb(manager));

    (ratingService.computePlayers as jest.Mock).mockResolvedValue(null);

    const res = await service.create(dto());
    expect(res).toBe(existing);
    expect(ratingService.computePlayers).not.toHaveBeenCalled();
  });

  it('computes rating, saves players, match and histories', async () => {
    const a = basePlayerA();
    const b = basePlayerB();
    const { manager, savePlayerSpy, saveMatchSpy, savePRHSpy } = buildManager({
      players: [a, b],
      existingMatch: null,
    });
    (dataSource.transaction as any) = jest.fn(async (cb: any) => cb(manager));

    (ratingService.computePlayers as jest.Mock).mockResolvedValue({
      aAfter: { mu: 26, sigma: 7.5 },
      bAfter: { mu: 24, sigma: 9.0 },
      aScore: 1510,
      bScore: 1490,
    });

    const before = {
      aMu: a.mu,
      aSigma: a.sigma,
      bMu: b.mu,
      bSigma: b.sigma,
    };

    const res = await service.create(dto(3, 2)); 

    expect(ratingService.computePlayers).toHaveBeenCalledTimes(1);
    expect(ratingService.computePlayers).toHaveBeenCalledWith({
      ...before,
      outcome: 'A',
    });

    expect(savePlayerSpy).toHaveBeenCalledTimes(1);
    const savedPlayersArg = savePlayerSpy.mock.calls[0][0] as Player[];
    const savedA = savedPlayersArg.find((p) => p.id === playerAId)!;
    const savedB = savedPlayersArg.find((p) => p.id === playerBId)!;
    expect(savedA.mu).toBe(26);
    expect(savedA.sigma).toBe(7.5);
    expect(savedA.rating).toBe(1510);
    expect(savedA.wins).toBe(1);
    expect(savedB.mu).toBe(24);
    expect(savedB.sigma).toBe(9.0);
    expect(savedB.rating).toBe(1490);
    expect(savedB.losses).toBe(1);

    expect(saveMatchSpy).toHaveBeenCalledTimes(1);
    expect(savePRHSpy).toHaveBeenCalledTimes(1);
    const prhBatch = savePRHSpy.mock.calls[0][0];
    expect(Array.isArray(prhBatch)).toBe(true);
    expect(prhBatch.length).toBe(2);

    expect(res).toMatchObject({ id: 'match-1' });
  });

  it('maps rating service failure to 502', async () => {
    const { manager } = buildManager({});
    (dataSource.transaction as any) = jest.fn(async (cb: any) => cb(manager));
    (ratingService.computePlayers as jest.Mock).mockRejectedValue(
      new Error('boom'),
    );

    await expect(service.create(dto())).rejects.toBeInstanceOf(HttpException);
    await expect(service.create(dto())).rejects.toMatchObject({
      status: HttpStatus.BAD_GATEWAY,
      message: 'Rating service failed',
    });
  });

  it('handles draw outcome correctly (D)', async () => {
    const a = basePlayerA();
    const b = basePlayerB();
    const { manager, savePlayerSpy } = buildManager({
      players: [a, b],
      existingMatch: null,
    });
    (dataSource.transaction as any) = jest.fn(async (cb: any) => cb(manager));

    (ratingService.computePlayers as jest.Mock).mockResolvedValue({
      aAfter: { mu: 25.1, sigma: 8.2 },
      bAfter: { mu: 25.1, sigma: 8.2 },
      aScore: 1500,
      bScore: 1500,
    });

    await service.create({ playerAId, playerBId, scoreA: 2, scoreB: 2 }); 

    expect(ratingService.computePlayers).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: 'D' }),
    );

    const savedPlayersArg = savePlayerSpy.mock.calls[0][0] as Player[];
    const savedA = savedPlayersArg.find((p) => p.id === playerAId)!;
    const savedB = savedPlayersArg.find((p) => p.id === playerBId)!;
    expect(savedA.draws).toBe(1);
    expect(savedB.draws).toBe(1);
  });


  // getAll
  it('getAll should return matches', async () => {
    const rows = [
      {
        id: 'm2',
        createdAt: new Date('2025-08-16T10:00:00Z'),
        playerA: { id: playerAId },
        playerB: { id: playerBId },
      },
      {
        id: 'm1',
        createdAt: new Date('2025-08-15T10:00:00Z'),
        playerA: { id: playerBId },
        playerB: { id: playerAId },
      },
    ] as Match[];

    const matchRepo = (service as any).matchRepo as { find: jest.Mock };
    matchRepo.find.mockResolvedValue(rows);

    const result = await service.getAll();

    expect(matchRepo.find).toHaveBeenCalledWith({
      relations: ['playerA', 'playerB'],
      order: { createdAt: 'DESC' },
    });
    expect(result).toBe(rows);
  });

  it('getAll throws 500 HttpException', async () => {
    const matchRepo = (service as any).matchRepo as { find: jest.Mock };
    matchRepo.find.mockRejectedValue(new Error('db failure'));

    await expect(service.getAll()).rejects.toEqual(
      new HttpException(
        'Failed to fetch matches',
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
    );
  });
});
