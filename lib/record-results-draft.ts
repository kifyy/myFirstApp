import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getAttemptsStorageKey,
  getRecordResultsDraftKey,
} from '@/constants/activity-attempt';
import type { RecordResultsDraft, RecordResultsFormFields } from '@/constants/record-results-draft';

export function formHasContent(fields: RecordResultsFormFields): boolean {
  return (
    fields.test1.trim().length > 0 ||
    fields.test2.trim().length > 0 ||
    fields.test3.trim().length > 0 ||
    fields.uploadedVideo !== null ||
    fields.location !== null ||
    (fields.locationError?.trim().length ?? 0) > 0
  );
}

export async function getNextAttemptNumber(activityKey: string): Promise<number> {
  try {
    const saved = await AsyncStorage.getItem(getAttemptsStorageKey(activityKey));
    if (!saved) {
      return 1;
    }
    const attempts = JSON.parse(saved) as unknown[];
    return attempts.length + 1;
  } catch {
    return 1;
  }
}

export async function loadRecordResultsDraft(activityKey: string): Promise<RecordResultsDraft | null> {
  try {
    const stored = await AsyncStorage.getItem(getRecordResultsDraftKey(activityKey));
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as RecordResultsDraft;
  } catch (error) {
    console.error('Error loading record results draft:', error);
    return null;
  }
}

export async function saveRecordResultsDraft(
  activityKey: string,
  fields: RecordResultsFormFields,
  attemptNumber: number
): Promise<void> {
  const draft: RecordResultsDraft = {
    ...fields,
    attemptNumber,
  };
  await AsyncStorage.setItem(getRecordResultsDraftKey(activityKey), JSON.stringify(draft));
}

export async function clearRecordResultsDraft(activityKey: string): Promise<void> {
  await AsyncStorage.removeItem(getRecordResultsDraftKey(activityKey));
}
