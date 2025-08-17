import { Body, Controller, Get, Post } from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchDto } from './dto/create-match.dto';

@Controller('match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  async getAll() {
    return await this.matchService.getAll();
  }
  
  @Post()
  async create(@Body() dto: CreateMatchDto) {
    return await this.matchService.create(dto);
  }
}
