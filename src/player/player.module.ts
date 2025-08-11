import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from 'src/entities/player.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Player])
  ],
  providers: [PlayerService],
  controllers: [PlayerController]
})
export class PlayerModule {}
