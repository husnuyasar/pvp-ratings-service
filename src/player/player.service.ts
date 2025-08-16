import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../entities/player.entity';
import { Repository } from 'typeorm';
import { CreatePlayerDto } from './dto/create-player.dto';
import { RatingService } from '../rating/rating.service';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly ratingService: RatingService,
  ) {}

  async get(id: string): Promise<Player> {
    const player = await this.playerRepository.findOne({ where: { id } });
    if (!player)
      throw new HttpException(
        'Player not found',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    return player;
  }

  async top10(): Promise<any> {
    try {
      return await this.playerRepository
        .createQueryBuilder('p')
        .select('p.id', 'id')
        .addSelect('p.username', 'name')
        .addSelect('p.rating', 'rating')
        .orderBy('p.rating', 'DESC')
        .limit(10)
        .getRawMany<{
          id: string;
          name: string;
          rating: number;
        }>();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async create(dto: CreatePlayerDto): Promise<Player> {
    const { username } = dto;
    const existingUsername = await this.playerRepository.findOne({
      where: { username },
    });
    if (existingUsername)
      throw new ConflictException('Username already exists');

    const base = this.ratingService.default();
    const player = {
      username,
      mu: base.mu,
      sigma: base.sigma,
      rating: this.ratingService.calRating(base),
    } as Player;
    try {
      return await this.playerRepository.save(player);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
