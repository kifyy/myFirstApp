export const MAX_PARACHUTE_TESTS = 3;

export type ParachuteTestResult = {
  timeS: number;
  velocityMs: number;
};

export type ParachuteActivityAttempt = {
  dropHeightM: number;
  baselineTimeS: number;
  baselineVelocityMs: number;
  parachutes: ParachuteTestResult[];
  createdAt: string;
  uploadedVideo?: string | null;
  location?: { latitude: number; longitude: number; accuracy: number } | null;
};

export type ParachuteRecordResultsFormFields = {
  dropHeight: string;
  baselineTime: string;
  parachuteTimes: string[];
  uploadedVideo: string | null;
  location: { latitude: number; longitude: number; accuracy: number } | null;
  locationError: string | null;
};

export type ParachuteRecordResultsDraft = ParachuteRecordResultsFormFields & {
  attemptNumber: number;
};

export function isParachuteActivityAttempt(value: unknown): value is ParachuteActivityAttempt {
  return (
    typeof value === 'object' &&
    value !== null &&
    'dropHeightM' in value &&
    'baselineTimeS' in value &&
    Array.isArray((value as ParachuteActivityAttempt).parachutes)
  );
}
