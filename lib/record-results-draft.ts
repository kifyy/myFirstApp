import type { RecordResultsDraft, RecordResultsFormFields } from '@/constants/record-results-draft';
import {
  clearRecordResultsDraft as clearDraftInDb,
  getActivityAttemptCount,
  loadRecordResultsDraftJson,
  saveRecordResultsDraftJson,
} from '@/lib/db';

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
    const count = await getActivityAttemptCount(activityKey);
    return count + 1;
  } catch {
    return 1;
  }
}

export async function loadRecordResultsDraft(activityKey: string): Promise<RecordResultsDraft | null> {
  try {
    return await loadRecordResultsDraftJson<RecordResultsDraft>(activityKey);
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
  await saveRecordResultsDraftJson(activityKey, draft);
}

export async function clearRecordResultsDraft(activityKey: string): Promise<void> {
  await clearDraftInDb(activityKey);
}
