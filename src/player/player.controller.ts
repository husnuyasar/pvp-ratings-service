import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';

@Controller('player')
@ApiTags('Player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Player ID', format: 'uuid' })
  get(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.playerService.get(id);
  }

  @Get('top10')
  async top10() {
    return await this.playerService.top10();
  }
}
