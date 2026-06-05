export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function formatAverageRating(value: number): string {
  return roundToOneDecimal(value).toFixed(1);
}
