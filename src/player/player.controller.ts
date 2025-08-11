import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlayerService } from './player.service';

@Controller('player')
@ApiTags('Player')
export class PlayerController {
    constructor(
        private readonly playerService: PlayerService
    ) {}

    @Get('top10')
    async top10() {
        return await this.playerService.top10();
    }
}
