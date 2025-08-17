import { Module } from '@nestjs/common';
import { PlayerRatingHistoryService } from './player-rating-history.service';
import { PlayerRatingHistoryController } from './player-rating-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerRatingHistory } from 'src/entities/player-rating-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerRatingHistory])],
  providers: [PlayerRatingHistoryService],
  controllers: [PlayerRatingHistoryController],
})
export class PlayerRatingHistoryModule {}
