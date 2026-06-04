/** Map expo-av metering (-160..0 dBFS) to a 0–120 dB display scale. */
export function meteringToDisplayDb(metering: number): number {
  return Math.min(120, Math.max(0, Math.round(160 + metering)));
}

export function formatDisplayDb(db: number | null): string {
  if (db === null) {
    return '—';
  }
  return `${db} dB`;
}
