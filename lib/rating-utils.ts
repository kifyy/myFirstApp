export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatAverageRating(value: number): string {
  return roundToOneDecimal(value).toFixed(1);
}

export function computeUpdatedAverage(
  currentAverage: number,
  currentCount: number,
  newRating: number,
  previousUserRating: number | null
): { averageRating: number; ratingCount: number } {
  if (previousUserRating === null) {
    const ratingCount = currentCount + 1;
    const averageRating = roundToOneDecimal(
      ratingCount === 0 ? newRating : (currentAverage * currentCount + newRating) / ratingCount
    );
    return { averageRating, ratingCount };
  }

  const ratingCount = Math.max(currentCount, 1);
  const averageRating = roundToOneDecimal(
    (currentAverage * ratingCount - previousUserRating + newRating) / ratingCount
  );
  return { averageRating, ratingCount };
}
