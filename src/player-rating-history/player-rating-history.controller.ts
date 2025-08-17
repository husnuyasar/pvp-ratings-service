import { Controller, Get } from '@nestjs/common';
import { PlayerRatingHistoryService } from './player-rating-history.service';

@Controller('player-rating-history')
export class PlayerRatingHistoryController {
  constructor(
    private readonly playerRatingHistoryService: PlayerRatingHistoryService,
  ) {}

  @Get()
  async getAll() {
    return await this.playerRatingHistoryService.getAll();
  }
}
