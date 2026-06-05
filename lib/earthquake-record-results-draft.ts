import {
  createEmptyEarthquakeDesign,
  type EarthquakeRecordResultsDraft,
  type EarthquakeRecordResultsFormFields,
} from '@/constants/earthquake-attempt';
import {
  clearRecordResultsDraft,
  getActivityAttemptCount,
  loadRecordResultsDraftJson,
  saveRecordResultsDraftJson,
} from '@/lib/db';

const ACTIVITY_KEY = 'activity-4';

export function earthquakeFormHasContent(fields: EarthquakeRecordResultsFormFields): boolean {
  return (
    fields.designs.some(
      (design) => design.description.trim().length > 0 || design.movementCm.trim().length > 0
    ) || fields.uploadedVideo !== null
  );
}

export async function getEarthquakeNextAttemptNumber(): Promise<number> {
  try {
    const count = await getActivityAttemptCount(ACTIVITY_KEY);
    return count + 1;
  } catch {
    return 1;
  }
}

export async function loadEarthquakeRecordResultsDraft(): Promise<EarthquakeRecordResultsDraft | null> {
  try {
    const parsed = await loadRecordResultsDraftJson<EarthquakeRecordResultsDraft>(ACTIVITY_KEY);
    if (!parsed) {
      return null;
    }
    if (!Array.isArray(parsed.designs) || parsed.designs.length === 0) {
      parsed.designs = [createEmptyEarthquakeDesign()];
    }
    return parsed;
  } catch (error) {
    console.error('Error loading earthquake record results draft:', error);
    return null;
  }
}

export async function saveEarthquakeRecordResultsDraft(
  fields: EarthquakeRecordResultsFormFields,
  attemptNumber: number
): Promise<void> {
  const draft: EarthquakeRecordResultsDraft = {
    ...fields,
    attemptNumber,
  };
  await saveRecordResultsDraftJson(ACTIVITY_KEY, draft);
}

export async function clearEarthquakeRecordResultsDraft(): Promise<void> {
  await clearRecordResultsDraft(ACTIVITY_KEY);
}
