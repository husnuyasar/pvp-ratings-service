import { Injectable } from '@nestjs/common';
import { ordinal, rate, rating, Rating } from 'openskill';
import { ComputeDto } from './dto/compute.dto';
import { ComputeResponseDto } from './dto/compute.response.dto';

@Injectable()
export class RatingService {
  default(): Rating {
    return rating();
  }

  calRating(rating: Rating): number {
    return ordinal(rating);
  }

  computePlayers(dto: ComputeDto): ComputeResponseDto {
    const aBefore = rating({ mu: dto.aMu, sigma: dto.aSigma });
    const bBefore = rating({ mu: dto.bMu, sigma: dto.bSigma });

    const ranks =
      dto.outcome === 'D' ? [0, 0] : dto.outcome === 'A' ? [0, 1] : [1, 0];
    const [[aAfter], [bAfter]] = rate([[aBefore], [bBefore]], { rank: ranks });

    return {
      aBefore,
      bBefore,
      aAfter,
      bAfter,
      aScore: ordinal(aAfter),
      bScore: ordinal(bAfter),
    } as ComputeResponseDto;
  }
}
