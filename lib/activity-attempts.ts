import type { ActivityAttempt } from '@/constants/activity-attempt';
import { getActivityAttemptCount, loadActivityAttempts } from '@/lib/db';

export type { ActivityAttempt };

export async function getActivityAttempts(
  activityKey: string
): Promise<Array<{ createdAt: string }>> {
  try {
    return await loadActivityAttempts<{ createdAt: string }>(activityKey);
  } catch (error) {
    console.error('Error loading activity attempts:', error);
    return [];
  }
}

export { getActivityAttemptCount };

export function hasAttemptDuringChallenge(
  attempts: { createdAt: string }[],
  startedAt: number,
  endsAt: number
): boolean {
  const windowEnd = Math.min(Date.now(), endsAt);
  return attempts.some((attempt) => {
    const recordedAt = new Date(attempt.createdAt).getTime();
    return recordedAt >= startedAt && recordedAt <= windowEnd;
  });
}
