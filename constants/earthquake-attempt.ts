export const MAX_EARTHQUAKE_DESIGNS = 3;

export type EarthquakeDesignResult = {
  description: string;
  movementCm: number;
};

export type EarthquakeActivityAttempt = {
  designs: EarthquakeDesignResult[];
  createdAt: string;
  uploadedVideo?: string | null;
};

export type EarthquakeDesignFormEntry = {
  description: string;
  movementCm: string;
};

export type EarthquakeRecordResultsFormFields = {
  designs: EarthquakeDesignFormEntry[];
  uploadedVideo: string | null;
};

export type EarthquakeRecordResultsDraft = EarthquakeRecordResultsFormFields & {
  attemptNumber: number;
};

export function createEmptyEarthquakeDesign(): EarthquakeDesignFormEntry {
  return {
    description: '',
    movementCm: '',
  };
}

export function isEarthquakeActivityAttempt(value: unknown): value is EarthquakeActivityAttempt {
  return (
    typeof value === 'object' &&
    value !== null &&
    'designs' in value &&
    Array.isArray((value as EarthquakeActivityAttempt).designs)
  );
}
