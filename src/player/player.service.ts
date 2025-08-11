import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Player } from '../entities/player.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PlayerService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
  ) {}

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
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
