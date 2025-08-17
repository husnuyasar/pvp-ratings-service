import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PlayerRatingHistory } from '../entities/player-rating-history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlayerRatingHistoryService {
  constructor(
    @InjectRepository(PlayerRatingHistory)
    private readonly playerRatingHistoryRepository: Repository<PlayerRatingHistory>,
  ) {}

  async getAll(): Promise<PlayerRatingHistory[]> {
    try {
      const history = await this.playerRatingHistoryRepository.find({
        relations: ['player', 'match'],
        order: { createdAt: 'DESC' },
      });
      return history;
    } catch (error: any) {
      throw new HttpException(
        'Failed to fetch player rating history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
