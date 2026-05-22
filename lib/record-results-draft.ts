import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  RECORD_RESULTS_DRAFT_KEY,
  type RecordResultsDraft,
  type RecordResultsFormFields,
} from '@/constants/record-results-draft';

const ATTEMPTS_KEY = 'activity-1-attempts';

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

export async function getNextAttemptNumber(): Promise<number> {
  try {
    const saved = await AsyncStorage.getItem(ATTEMPTS_KEY);
    if (!saved) {
      return 1;
    }
    const attempts = JSON.parse(saved) as unknown[];
    return attempts.length + 1;
  } catch {
    return 1;
  }
}

export async function loadRecordResultsDraft(): Promise<RecordResultsDraft | null> {
  try {
    const stored = await AsyncStorage.getItem(RECORD_RESULTS_DRAFT_KEY);
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
  fields: RecordResultsFormFields,
  attemptNumber: number
): Promise<void> {
  const draft: RecordResultsDraft = {
    ...fields,
    attemptNumber,
  };
  await AsyncStorage.setItem(RECORD_RESULTS_DRAFT_KEY, JSON.stringify(draft));
}

export async function clearRecordResultsDraft(): Promise<void> {
  await AsyncStorage.removeItem(RECORD_RESULTS_DRAFT_KEY);
}
