import AsyncStorage from '@react-native-async-storage/async-storage';

export type ActivityAttempt = {
  createdAt: string;
};

export function getAttemptsStorageKey(activityKey: string): string {
  return `${activityKey}-attempts`;
}

export async function getActivityAttempts(activityKey: string): Promise<ActivityAttempt[]> {
  try {
    const stored = await AsyncStorage.getItem(getAttemptsStorageKey(activityKey));
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as ActivityAttempt[];
  } catch (error) {
    console.error('Error loading activity attempts:', error);
    return [];
  }
}

export async function getActivityAttemptCount(activityKey: string): Promise<number> {
  const attempts = await getActivityAttempts(activityKey);
  return attempts.length;
}

export function hasAttemptDuringChallenge(
  attempts: ActivityAttempt[],
  startedAt: number,
  endsAt: number
): boolean {
  const windowEnd = Math.min(Date.now(), endsAt);
  return attempts.some((attempt) => {
    const recordedAt = new Date(attempt.createdAt).getTime();
    return recordedAt >= startedAt && recordedAt <= windowEnd;
  });
}
