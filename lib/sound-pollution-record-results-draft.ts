import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAttemptsStorageKey, getRecordResultsDraftKey } from '@/constants/activity-attempt';
import {
  createEmptySoundAction,
  type SoundPollutionRecordResultsDraft,
  type SoundPollutionRecordResultsFormFields,
} from '@/constants/sound-pollution-attempt';

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
    const saved = await AsyncStorage.getItem(getAttemptsStorageKey(ACTIVITY_KEY));
    if (!saved) {
      return 1;
    }
    const attempts = JSON.parse(saved) as unknown[];
    return attempts.length + 1;
  } catch {
    return 1;
  }
}

export async function loadSoundPollutionRecordResultsDraft(): Promise<SoundPollutionRecordResultsDraft | null> {
  try {
    const stored = await AsyncStorage.getItem(getRecordResultsDraftKey(ACTIVITY_KEY));
    if (!stored) {
      return null;
    }
    const parsed = JSON.parse(stored) as SoundPollutionRecordResultsDraft;
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
  await AsyncStorage.setItem(getRecordResultsDraftKey(ACTIVITY_KEY), JSON.stringify(draft));
}

export async function clearSoundPollutionRecordResultsDraft(): Promise<void> {
  await AsyncStorage.removeItem(getRecordResultsDraftKey(ACTIVITY_KEY));
}
