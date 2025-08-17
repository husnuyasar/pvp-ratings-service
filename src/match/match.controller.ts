import { Body, Controller, Post } from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchDto } from './dto/create-match.dto';

@Controller('match')
export class MatchController {
    constructor(private readonly matchService: MatchService)
    {}

    @Post()
    async create(@Body() dto: CreateMatchDto) {
        return await this.matchService.create(dto);
    }
}
