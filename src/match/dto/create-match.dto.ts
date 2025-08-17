import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateMatchDto {
  @ApiProperty({
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  playerAId: string;

  @ApiProperty({
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  playerBId: string;

  @ApiProperty({
    type: Number,
    minimum: 0,
    required: true,
  })
  @IsInt()
  @Min(0)
  scoreA: number;

  @ApiProperty({
    type: Number,
    minimum: 0,
    required: true,
  })
  @IsInt()
  @Min(0)
  scoreB: number;
}
