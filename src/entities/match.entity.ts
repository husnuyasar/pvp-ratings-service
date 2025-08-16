import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Player } from './player.entity';

@Entity({ name: 'matches' })
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne((type) => Player, (playerA) => playerA.id)
  playerA: Player;

  @ManyToOne((type) => Player, (playerB) => playerB.id)
  playerB: Player;

  @Column()
  scoreA: number;

  @Column()
  scoreB: number;

  @Column()
  isDraw: boolean;

  @Column('jsonb')
  ratingsBefore: {
    a: { mu: number; sigma: number };
    b: { mu: number; sigma: number };
  };

  @Column('jsonb')
  ratingsAfter: {
    a: { mu: number; sigma: number };
    b: { mu: number; sigma: number };
  };

  @CreateDateColumn()
  createdAt!: Date;
}
