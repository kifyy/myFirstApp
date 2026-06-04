import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAttemptsStorageKey, getRecordResultsDraftKey } from '@/constants/activity-attempt';
import type {
  ParachuteRecordResultsDraft,
  ParachuteRecordResultsFormFields,
} from '@/constants/parachute-attempt';

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
    const saved = await AsyncStorage.getItem(getAttemptsStorageKey('activity-1'));
    if (!saved) {
      return 1;
    }
    const attempts = JSON.parse(saved) as unknown[];
    return attempts.length + 1;
  } catch {
    return 1;
  }
}

export async function loadParachuteRecordResultsDraft(): Promise<ParachuteRecordResultsDraft | null> {
  try {
    const stored = await AsyncStorage.getItem(getRecordResultsDraftKey('activity-1'));
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored) as ParachuteRecordResultsDraft;
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
  await AsyncStorage.setItem(
    getRecordResultsDraftKey('activity-1'),
    JSON.stringify(draft)
  );
}

export async function clearParachuteRecordResultsDraft(): Promise<void> {
  await AsyncStorage.removeItem(getRecordResultsDraftKey('activity-1'));
}
