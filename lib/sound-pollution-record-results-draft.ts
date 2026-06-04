import {
  createEmptySoundAction,
  type SoundPollutionRecordResultsDraft,
  type SoundPollutionRecordResultsFormFields,
} from '@/constants/sound-pollution-attempt';
import {
  clearRecordResultsDraft,
  getActivityAttemptCount,
  loadRecordResultsDraftJson,
  saveRecordResultsDraftJson,
} from '@/lib/db';

const ACTIVITY_KEY = 'activity-2';

export function soundPollutionFormHasContent(fields: SoundPollutionRecordResultsFormFields): boolean {
  return (
    fields.actions.some(
      (action) =>
        action.loudestDb !== null ||
        action.howMade.trim().length > 0 ||
        action.location !== null ||
        action.soundZone !== null ||
        (action.locationError?.trim().length ?? 0) > 0
    ) || fields.uploadedVideo !== null
  );
}

export async function getSoundPollutionNextAttemptNumber(): Promise<number> {
  try {
    const count = await getActivityAttemptCount(ACTIVITY_KEY);
    return count + 1;
  } catch {
    return 1;
  }
}

export async function loadSoundPollutionRecordResultsDraft(): Promise<SoundPollutionRecordResultsDraft | null> {
  try {
    const parsed = await loadRecordResultsDraftJson<SoundPollutionRecordResultsDraft>(ACTIVITY_KEY);
    if (!parsed) {
      return null;
    }
    if (!Array.isArray(parsed.actions) || parsed.actions.length === 0) {
      parsed.actions = [createEmptySoundAction()];
    }
    return parsed;
  } catch (error) {
    console.error('Error loading sound pollution record results draft:', error);
    return null;
  }
}

export async function saveSoundPollutionRecordResultsDraft(
  fields: SoundPollutionRecordResultsFormFields,
  attemptNumber: number
): Promise<void> {
  const draft: SoundPollutionRecordResultsDraft = {
    ...fields,
    attemptNumber,
  };
  await saveRecordResultsDraftJson(ACTIVITY_KEY, draft);
}

export async function clearSoundPollutionRecordResultsDraft(): Promise<void> {
  await clearRecordResultsDraft(ACTIVITY_KEY);
}
