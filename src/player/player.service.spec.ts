import { Test, TestingModule } from '@nestjs/testing';
import { PlayerService } from './player.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Player } from '../entities/player.entity';
import { Repository } from 'typeorm';
import { ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { RatingService } from '../rating/rating.service';

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
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const ratingServiceMock = {
    default: jest.fn().mockReturnValue({ mu: 25, sigma: 25 / 3 }),
    calRating: jest.fn().mockReturnValue(1200),
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
        {
          provide: RatingService,
          useValue: ratingServiceMock,
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

  const playerSample: Player = {
    id: 'd9ce350e-029a-44c0-a878-a3c64db6d359',
    username: 'ash',
    mu: 25,
    sigma: 25 / 3,
    rating: 25 - 3 * (25 / 3),
    wins: 1,
    losses: 0,
    draws: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Player;

  // get method
  it('get(:id) returns player', async () => {
    (repoMock.findOne as jest.Mock).mockResolvedValue(playerSample);

    const result = await service.get(playerSample.id);

    expect(repoMock.findOne).toHaveBeenCalledWith({
      where: { id: playerSample.id },
    });
    expect(result).toBe(playerSample);
  });

  it('get(:id) throws 422', async () => {
    (repoMock.findOne as jest.Mock).mockResolvedValue(null);

    await expect(service.get(playerSample.id)).rejects.toEqual(
      new HttpException('Player not found', HttpStatus.UNPROCESSABLE_ENTITY),
    );

    expect(repoMock.findOne).toHaveBeenCalledWith({
      where: { id: playerSample.id },
    });
  });

  // create method
  it('create a new player when username is unique', async () => {
    // username doesn't exist
    (repoMock.findOne as jest.Mock).mockResolvedValue(null);
    (repoMock.save as jest.Mock).mockResolvedValue({
      id: '1',
      username: 'pikachu',
    });

    const dto = { username: 'pikachu' };
    const result = await service.create(dto as any);

    expect(repoMock.findOne as jest.Mock).toHaveBeenCalledWith({
      where: { username: 'pikachu' },
    });
    expect(ratingServiceMock.default).toHaveBeenCalled();
    expect(ratingServiceMock.calRating).toHaveBeenCalled();
    expect(repoMock.save as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({
        username: 'pikachu',
        mu: 25,
        sigma: 25 / 3,
        rating: 1200,
      }),
    );
    expect(result).toEqual({ id: '1', username: 'pikachu' });
  });

  it('create throw ConflictException when username exists', async () => {
    (repoMock.findOne as jest.Mock).mockResolvedValue(playerSample);

    const dto = { username: 'ash' };

    await expect(service.create(dto as any)).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(repoMock.findOne as jest.Mock).toHaveBeenCalledWith({
      where: { username: 'ash' },
    });
    expect(repoMock.save as jest.Mock).not.toHaveBeenCalled();
  });

  it('create return HttpException(500)', async () => {
    (repoMock.findOne as jest.Mock).mockResolvedValue(null);
    (repoMock.save as jest.Mock).mockRejectedValue(
      new Error('DB error'),
    );

    const dto = { username: 'misty' };

    await expect(service.create(dto as any)).rejects.toEqual(
      new HttpException('DB error', HttpStatus.INTERNAL_SERVER_ERROR),
    );

    expect(repoMock.findOne as jest.Mock).toHaveBeenCalledWith({
      where: { username: 'misty' },
    });
    expect(repoMock.save as jest.Mock).toHaveBeenCalled();
  });
});
