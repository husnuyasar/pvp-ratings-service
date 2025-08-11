import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Player } from '../entities/player.entity';
import { Repository } from 'typeorm';

describe('PlayerService', () => {
  let service: PlayerService;

  const qb: any = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
  };

  const repoMock = {
    createQueryBuilder: jest.fn().mockReturnValue(qb),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerService,
        {
          provide: getRepositoryToken(Player),
          useValue: repoMock as Partial<Repository<Player>>,
        },
      ],
    }).compile();

    service = module.get<PlayerService>(PlayerService);
  });

  it('top10 should return 10 players ordered by rating desc', async () => {
    const rows = [{ id: '1', name: 'ash', rating: 1900 }];
    qb.getRawMany.mockResolvedValue(rows);

    const result = await service.top10();


     expect(repoMock.createQueryBuilder).toHaveBeenCalledWith('p');
     expect(qb.select).toHaveBeenCalledWith('p.id', 'id');
     expect(qb.addSelect).toHaveBeenCalledWith('p.username', 'name');
     expect(qb.addSelect).toHaveBeenCalledWith('p.rating', 'rating');
     expect(qb.orderBy).toHaveBeenCalledWith('p.rating', 'DESC');
     expect(qb.limit).toHaveBeenCalledWith(10);
     expect(qb.getRawMany).toHaveBeenCalled();
     expect(result).toEqual(rows);
  });
});