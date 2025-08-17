import { Body, Controller, Get, Post } from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('match')
@ApiTags('Match')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Get()
  @ApiOperation({
    summary: 'List all matches',
    description: 'Returns all matches with player relations',
  })
  async getAll() {
    return await this.matchService.getAll();
  }

  @Post()
  @ApiOperation({
    summary: 'Create a 1v1 match',
  })
  @ApiBody({
    type: CreateMatchDto,
  })
  async create(@Body() dto: CreateMatchDto) {
    return await this.matchService.create(dto);
  }
}
