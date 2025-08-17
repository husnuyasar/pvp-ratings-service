import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';

@Controller('player')
@ApiTags('Player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('top10')
  @ApiOperation({
    summary: 'Get top 10 players',
    description: 'Returns the top 10 players ordered by rating (descending).',
  })
  async top10() {
    return await this.playerService.top10();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a player by ID',
    description: 'Fetch a single player by UUID v4.',
  })
  @ApiParam({ name: 'id', description: 'Player ID', format: 'uuid' })
  async get(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return await this.playerService.get(id);
  }

  @Post('add')
  @ApiOperation({
    summary: 'Create a new player',
  })
  @ApiBody({ type: CreatePlayerDto })
  async create(@Body() dto: CreatePlayerDto) {
    return await this.playerService.create(dto);
  }
}
