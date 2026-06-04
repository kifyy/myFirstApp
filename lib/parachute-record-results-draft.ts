import type {
  ParachuteRecordResultsDraft,
  ParachuteRecordResultsFormFields,
} from '@/constants/parachute-attempt';
import {
  clearRecordResultsDraft,
  getActivityAttemptCount,
  loadRecordResultsDraftJson,
  saveRecordResultsDraftJson,
} from '@/lib/db';

const ACTIVITY_KEY = 'activity-1';

export function parachuteFormHasContent(fields: ParachuteRecordResultsFormFields): boolean {
  return (
    fields.dropHeight.trim().length > 0 ||
    fields.baselineTime.trim().length > 0 ||
    fields.parachuteTimes.some((time) => time.trim().length > 0) ||
    fields.uploadedVideo !== null ||
    fields.location !== null ||
    (fields.locationError?.trim().length ?? 0) > 0
  );
}

export async function getParachuteNextAttemptNumber(): Promise<number> {
  try {
    const count = await getActivityAttemptCount(ACTIVITY_KEY);
    return count + 1;
  } catch {
    return 1;
  }
}

export async function loadParachuteRecordResultsDraft(): Promise<ParachuteRecordResultsDraft | null> {
  try {
    const parsed = await loadRecordResultsDraftJson<ParachuteRecordResultsDraft>(ACTIVITY_KEY);
    if (!parsed) {
      return null;
    }
    if (!Array.isArray(parsed.parachuteTimes) || parsed.parachuteTimes.length === 0) {
      parsed.parachuteTimes = [''];
    }
    return parsed;
  } catch (error) {
    console.error('Error loading parachute record results draft:', error);
    return null;
  }
}

export async function saveParachuteRecordResultsDraft(
  fields: ParachuteRecordResultsFormFields,
  attemptNumber: number
): Promise<void> {
  const draft: ParachuteRecordResultsDraft = {
    ...fields,
    attemptNumber,
  };
  await saveRecordResultsDraftJson(ACTIVITY_KEY, draft);
}

export async function clearParachuteRecordResultsDraft(): Promise<void> {
  await clearRecordResultsDraft(ACTIVITY_KEY);
}
