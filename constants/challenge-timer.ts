export const CHALLENGE_TIMER_STORAGE_KEY = 'challenge-timer-state';
export const CHALLENGE_DURATION_MS = 30 * 60 * 1000;
export const CHALLENGE_COUNTDOWN_NOTIFICATION_ID = 'stemm-lab-challenge-countdown';

export type ChallengeTimerState = {
  activityKey: string;
  activityTitle: string;
  startedAt: number;
  endsAt: number;
};
