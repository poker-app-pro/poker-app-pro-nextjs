export class CalculatePointsUseCase {
  execute(finalPosition: number, playerCount: number) {
    if (finalPosition <= 0 || playerCount <= 0) {
      return 0;
    }

    const basePoints = playerCount * 10;
    const decay = Math.max(1, finalPosition);

    return Math.max(0, Math.round(basePoints / decay));
  }
}
