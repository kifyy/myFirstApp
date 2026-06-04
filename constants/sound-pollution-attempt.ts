export const MAX_SOUND_ACTIONS = 3;

export const DEFAULT_SOUND_ZONE_RADIUS_M = 10;

export type SoundZoneMarker = {
  latitude: number;
  longitude: number;
  radiusM: number;
};

export type TaggedLocation = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export type SoundActionRecord = {
  loudestDb: number;
  howMade: string;
  location: TaggedLocation | null;
  soundZone: SoundZoneMarker | null;
};

export type SoundPollutionActivityAttempt = {
  actions: SoundActionRecord[];
  createdAt: string;
  uploadedVideo?: string | null;
};

export type SoundActionFormEntry = {
  loudestDb: number | null;
  howMade: string;
  location: TaggedLocation | null;
  locationError: string | null;
  soundZone: SoundZoneMarker | null;
  zoneRadiusM: string;
};

export type SoundPollutionRecordResultsFormFields = {
  actions: SoundActionFormEntry[];
  uploadedVideo: string | null;
};

export type SoundPollutionRecordResultsDraft = SoundPollutionRecordResultsFormFields & {
  attemptNumber: number;
};

export function createEmptySoundAction(): SoundActionFormEntry {
  return {
    loudestDb: null,
    howMade: '',
    location: null,
    locationError: null,
    soundZone: null,
    zoneRadiusM: String(DEFAULT_SOUND_ZONE_RADIUS_M),
  };
}

export function isSoundPollutionActivityAttempt(value: unknown): value is SoundPollutionActivityAttempt {
  return (
    typeof value === 'object' &&
    value !== null &&
    'actions' in value &&
    Array.isArray((value as SoundPollutionActivityAttempt).actions)
  );
}
