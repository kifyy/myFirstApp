/** Allow digits and at most one decimal place. */
export function sanitizeDecimalInput(text: string): string {
  let cleaned = text.replace(/[^0-9.]/g, '');
  const dotIndex = cleaned.indexOf('.');
  if (dotIndex === -1) {
    return cleaned;
  }
  const whole = cleaned.slice(0, dotIndex);
  const fraction = cleaned.slice(dotIndex + 1).replace(/\./g, '').slice(0, 1);
  return `${whole}.${fraction}`;
}

export function parseOneDecimal(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = parseFloat(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return Math.round(parsed * 10) / 10;
}

export function formatOneDecimal(value: number): string {
  return (Math.round(value * 10) / 10).toFixed(1);
}

export function formatVelocityEquation(distanceM: number, timeS: number): string {
  const velocity = timeS > 0 ? Math.round((distanceM / timeS) * 10) / 10 : 0;
  return `${formatOneDecimal(distanceM)} m / ${formatOneDecimal(timeS)} s = ${formatOneDecimal(velocity)} m/s`;
}

export function computeVelocityMs(distanceM: number, timeS: number): number | null {
  if (timeS <= 0) {
    return null;
  }
  return Math.round((distanceM / timeS) * 10) / 10;
}
