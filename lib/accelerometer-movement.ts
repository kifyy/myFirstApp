import { Accelerometer, type AccelerometerMeasurement } from 'expo-sensors';

const CM_PER_PEAK_G = 2.5;
const BASELINE_SAMPLE_COUNT = 8;
const UPDATE_INTERVAL_MS = 50;

export function vectorMagnitudeG(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

export function peakDeltaGToMovementCm(peakDeltaG: number): number {
  return Math.round(peakDeltaG * CM_PER_PEAK_G * 10) / 10;
}

export type MovementTracker = {
  start: () => Promise<boolean>;
  stop: () => number;
  getLiveMovementCm: () => number;
  reset: () => void;
};

export function createMovementTracker(): MovementTracker {
  let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;
  let baselineG = 1;
  let baselineSamples: number[] = [];
  let peakDeltaG = 0;

  const reset = () => {
    baselineG = 1;
    baselineSamples = [];
    peakDeltaG = 0;
  };

  const handleReading = ({ x, y, z }: AccelerometerMeasurement) => {
    const magnitudeG = vectorMagnitudeG(x, y, z);

    if (baselineSamples.length < BASELINE_SAMPLE_COUNT) {
      baselineSamples.push(magnitudeG);
      if (baselineSamples.length === BASELINE_SAMPLE_COUNT) {
        baselineG =
          baselineSamples.reduce((sum, value) => sum + value, 0) / BASELINE_SAMPLE_COUNT;
      }
      return;
    }

    const delta = Math.abs(magnitudeG - baselineG);
    if (delta > peakDeltaG) {
      peakDeltaG = delta;
    }
  };

  return {
    reset,
    getLiveMovementCm: () => peakDeltaGToMovementCm(peakDeltaG),
    async start() {
      reset();
      const available = await Accelerometer.isAvailableAsync();
      if (!available) {
        return false;
      }

      const permission = await Accelerometer.requestPermissionsAsync();
      if (!permission.granted) {
        return false;
      }

      Accelerometer.setUpdateInterval(UPDATE_INTERVAL_MS);
      subscription = Accelerometer.addListener(handleReading);
      return true;
    },
    stop() {
      subscription?.remove();
      subscription = null;
      return peakDeltaGToMovementCm(peakDeltaG);
    },
  };
}
