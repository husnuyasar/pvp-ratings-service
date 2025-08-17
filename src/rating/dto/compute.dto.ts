export type Outcome = 'A' | 'B' | 'D';
export class ComputeDto {
  aMu: number;
  aSigma: number;
  bMu: number;
  bSigma: number;
  outcome: Outcome;
}
