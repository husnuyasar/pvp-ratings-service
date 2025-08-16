import { Injectable } from '@nestjs/common';
import { ordinal, rating, Rating } from 'openskill';

@Injectable()
export class RatingService {
    default(): Rating {
        return rating();
    }

    calRating(rating: Rating): number {
        return ordinal(rating);
    }
}
