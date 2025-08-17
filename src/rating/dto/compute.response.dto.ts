import { Rating } from "openskill";

export class ComputeResponseDto {
  aBefore: Rating;
  bBefore: Rating;
  aAfter: Rating;
  bAfter: Rating;
  aScore: number;
  bScore: number;
}