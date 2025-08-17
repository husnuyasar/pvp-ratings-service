import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './db-config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { PlayerModule } from './player/player.module';
import { MatchModule } from './match/match.module';
import { PlayerRatingHistoryModule } from './player-rating-history/player-rating-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    PlayerModule,
    MatchModule,
    PlayerRatingHistoryModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
