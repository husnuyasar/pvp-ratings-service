import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from '../entities/player.entity';
import { RatingService } from '../rating/rating.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player])
  ],
  providers: [PlayerService, RatingService],
  controllers: [PlayerController]
})
export class PlayerModule {}
