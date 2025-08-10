import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Player } from "./player.entity";
import { Match } from "./match.entity";

@Entity({ name: 'player_rating_history' })
@Index('idx_prh_player_created_at', ['player', 'createdAt'])
export class PlayerRatingHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne((type) => Player, p => p.id)
  player!: Player;

  @ManyToOne((type) => Match, m=>m.id)
  match!: Match;

  @Column('double precision')
  muBefore!: number;

  @Column('double precision')
  sigmaBefore!: number;

  @Column('double precision')
  muAfter!: number;

  @Column('double precision')
  sigmaAfter!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
