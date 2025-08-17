import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';
import { CreatePlayerDto } from './dto/create-player.dto';

@Controller('player')
@ApiTags('Player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('top10')
  async top10() {
    return await this.playerService.top10();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Player ID', format: 'uuid' })
  async get(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return await this.playerService.get(id);
  }

  @Post('add')
  @ApiBody({ type: CreatePlayerDto })
  async create(@Body() dto: CreatePlayerDto) {
    return await this.playerService.create(dto);
  }
}
