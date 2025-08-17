import { Test, TestingModule } from '@nestjs/testing';
import { PlayerRatingHistoryService } from './player-rating-history.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PlayerRatingHistory } from '../entities/player-rating-history.entity';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('PlayerRatingHistoryService', () => {
  let service: PlayerRatingHistoryService;
  let repo: { find: jest.Mock };

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerRatingHistoryService,
        { provide: getRepositoryToken(PlayerRatingHistory), useValue: repo },
      ],
    }).compile();

    service = module.get<PlayerRatingHistoryService>(
      PlayerRatingHistoryService,
    );
  });


  it('getAll returns history', async () => {
    const rows: Partial<PlayerRatingHistory>[] = [
      {
        id: 'h1' as any,
        createdAt: new Date('2025-08-16') as any,
        player: { id: 'p1' } as any,
        match: { id: 'm1' } as any,
        muBefore: 25,
        sigmaBefore: 8.33,
        muAfter: 26,
        sigmaAfter: 7.5,
      },
      {
        id: 'h2' as any,
        createdAt: new Date('2025-08-15') as any,
        player: { id: 'p2' } as any,
        match: { id: 'm2' } as any,
        muBefore: 25,
        sigmaBefore: 8.33,
        muAfter: 24,
        sigmaAfter: 9.0,
      },
    ] as any;

    repo.find.mockResolvedValue(rows);

    const result = await service.getAll();

    expect(repo.find).toHaveBeenCalledWith({
      relations: ['player', 'match'],
      order: { createdAt: 'DESC' },
    });
    expect(result).toBe(rows);
  });

  it('getAll: throws 500 HttpException', async () => {
    repo.find.mockRejectedValue(new Error('db down'));

    await expect(service.getAll()).rejects.toMatchObject({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to fetch player rating history',
    });
    await expect(service.getAll()).rejects.toBeInstanceOf(HttpException);
  });
});
