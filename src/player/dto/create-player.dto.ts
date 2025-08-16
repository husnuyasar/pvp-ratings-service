import { ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  @IsAlphanumeric()
  @ApiProperty({
    required: true,
  })
  username: string;
}
