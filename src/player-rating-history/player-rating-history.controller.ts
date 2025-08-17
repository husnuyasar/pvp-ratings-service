import { Controller, Get } from '@nestjs/common';
import { PlayerRatingHistoryService } from './player-rating-history.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('player-rating-history')
@ApiTags('PlayerRatingHistory')
export class PlayerRatingHistoryController {
  constructor(
    private readonly playerRatingHistoryService: PlayerRatingHistoryService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all player rating history',
    description: 'Returns all history with player and match relations',
  })
  async getAll() {
    return await this.playerRatingHistoryService.getAll();
  }
}
