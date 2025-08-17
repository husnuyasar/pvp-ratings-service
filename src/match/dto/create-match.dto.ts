import { IsInt, IsUUID, Min } from "class-validator";

export class CreateMatchDto {
  @IsUUID()
  playerAId: string;

  @IsUUID()
  playerBId: string;

  @IsInt()
  @Min(0)
  scoreA: number;

  @IsInt()
  @Min(0)
  scoreB: number;
}