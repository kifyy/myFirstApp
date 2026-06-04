import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert, AppState, type AppStateStatus } from 'react-native';

import {
  getActivityAttemptCount,
  getActivityAttempts,
  hasAttemptDuringChallenge,
} from '@/lib/activity-attempts';
import { CHALLENGE_DURATION_MS, type ChallengeTimerState } from '@/constants/challenge-timer';
import {
  clearChallengeTimer,
  initDatabase,
  loadChallengeTimer,
  loadUserProfile,
  saveChallengeTimer,
} from '@/lib/db';
import {
  dismissChallengeCountdownNotification,
  showChallengeCountdownNotification,
  updateChallengeCountdownNotification,
} from '@/lib/challenge-countdown-notification';
import { notifyChallengeStarted } from '@/lib/challenge-notifications';
import { addLeaderboardPoint } from '@/lib/leaderboard-storage';

type ChallengeTimerContextValue = {
  timer: ChallengeTimerState | null;
  isRunning: boolean;
  remainingMs: number;
  startChallenge: (activityKey: string, activityTitle: string) => Promise<void>;
  leaveChallenge: () => Promise<void>;
  reportAttemptRecorded: (activityKey: string) => Promise<void>;
  refreshTimer: () => Promise<void>;
};

const ChallengeTimerContext = createContext<ChallengeTimerContextValue | null>(null);

function getRemainingMs(endsAt: number): number {
  return Math.max(0, endsAt - Date.now());
}

function normalizeTimerState(raw: ChallengeTimerState): ChallengeTimerState {
  const endsAt = raw.endsAt ?? raw.startedAt + CHALLENGE_DURATION_MS;
  return {
    ...raw,
    endsAt,
    attemptCountAtStart: raw.attemptCountAtStart ?? 0,
    pointsAwarded: raw.pointsAwarded ?? false,
  };
}

export function ChallengeTimerProvider({ children }: { children: React.ReactNode }) {
  const [timer, setTimer] = useState<ChallengeTimerState | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const isFinalizingRef = useRef(false);

  const syncRemaining = useCallback((state: ChallengeTimerState | null) => {
    if (!state) {
      setRemainingMs(0);
      return 0;
    }
    const remaining = getRemainingMs(state.endsAt);
    setRemainingMs(remaining);
    return remaining;
  }, []);

  const persistTimer = useCallback(async (state: ChallengeTimerState | null) => {
    if (!state) {
      await clearChallengeTimer();
      return;
    }
    await saveChallengeTimer(state);
  }, []);

  const clearChallenge = useCallback(async () => {
    await clearChallengeTimer();
    await dismissChallengeCountdownNotification();
    setTimer(null);
    syncRemaining(null);
  }, [syncRemaining]);

  const checkAttemptDuringChallenge = useCallback(async (state: ChallengeTimerState) => {
    const attempts = await getActivityAttempts(state.activityKey);
    return hasAttemptDuringChallenge(attempts, state.startedAt, state.endsAt);
  }, []);

  const finalizeChallenge = useCallback(
    async (state: ChallengeTimerState, completed: boolean) => {
      if (isFinalizingRef.current) {
        return;
      }
      isFinalizingRef.current = true;

      try {
        if (completed) {
          if (!state.pointsAwarded) {
            const { profile } = await loadUserProfile();
            if (profile) {
              await addLeaderboardPoint(profile);
            }
          }
          Alert.alert('Challenge Complete!', 'Great work — your attempt was recorded in time.');
        } else {
          Alert.alert('Challenge time has ended', 'No attempt was recorded before the timer finished.');
        }
      } finally {
        await clearChallenge();
        isFinalizingRef.current = false;
      }
    },
    [clearChallenge]
  );

  const tryCompleteChallenge = useCallback(
    async (state: ChallengeTimerState) => {
      const recorded = await checkAttemptDuringChallenge(state);
      if (recorded) {
        await finalizeChallenge(state, true);
        return true;
      }
      return false;
    },
    [checkAttemptDuringChallenge, finalizeChallenge]
  );

  const handleTimerExpired = useCallback(
    async (state: ChallengeTimerState) => {
      const recorded = await checkAttemptDuringChallenge(state);
      await finalizeChallenge(state, recorded);
    },
    [checkAttemptDuringChallenge, finalizeChallenge]
  );

  const refreshTimer = useCallback(async () => {
    try {
      await initDatabase();
      const stored = await loadChallengeTimer();
      if (!stored) {
        setTimer(null);
        syncRemaining(null);
        return;
      }

      const parsed = normalizeTimerState(stored);
      const remaining = getRemainingMs(parsed.endsAt);

      if (remaining <= 0) {
        await handleTimerExpired(parsed);
        return;
      }

      setTimer(parsed);
      syncRemaining(parsed);
      await updateChallengeCountdownNotification(parsed.activityTitle, remaining);
    } catch (error) {
      console.error('Error loading challenge timer:', error);
      setTimer(null);
      syncRemaining(null);
    } finally {
      setIsLoading(false);
    }
  }, [handleTimerExpired, syncRemaining]);

  useEffect(() => {
    refreshTimer();
  }, [refreshTimer]);

  useEffect(() => {
    if (!timer) {
      return;
    }

    const tick = async () => {
      const remaining = syncRemaining(timer);

      if (remaining <= 0) {
        await handleTimerExpired(timer);
        return;
      }

      const completed = await tryCompleteChallenge(timer);
      if (completed) {
        return;
      }

      await updateChallengeCountdownNotification(timer.activityTitle, remaining);
    };

    const intervalId = setInterval(() => {
      void tick();
    }, 1000);

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active' || nextState === 'background' || nextState === 'inactive') {
        void tick();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppState);

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [timer, syncRemaining, handleTimerExpired, tryCompleteChallenge]);

  const startChallenge = useCallback(
    async (activityKey: string, activityTitle: string) => {
      isFinalizingRef.current = false;
      const startedAt = Date.now();
      const attemptCountAtStart = await getActivityAttemptCount(activityKey);
      const nextTimer: ChallengeTimerState = {
        activityKey,
        activityTitle,
        startedAt,
        endsAt: startedAt + CHALLENGE_DURATION_MS,
        attemptCountAtStart,
        pointsAwarded: false,
      };

      await persistTimer(nextTimer);
      setTimer(nextTimer);
      syncRemaining(nextTimer);
      await notifyChallengeStarted(activityTitle);
      await showChallengeCountdownNotification(activityTitle, CHALLENGE_DURATION_MS);
    },
    [persistTimer, syncRemaining]
  );

  const leaveChallenge = useCallback(async () => {
    isFinalizingRef.current = false;
    await clearChallenge();
  }, [clearChallenge]);

  const reportAttemptRecorded = useCallback(
    async (activityKey: string) => {
      if (!timer || timer.activityKey !== activityKey || isFinalizingRef.current) {
        return;
      }

      const recorded = await checkAttemptDuringChallenge(timer);
      if (recorded) {
        const updatedTimer: ChallengeTimerState = { ...timer, pointsAwarded: timer.pointsAwarded };
        await tryCompleteChallenge(updatedTimer);
      }
    },
    [timer, checkAttemptDuringChallenge, tryCompleteChallenge]
  );

  const value = useMemo(
    () => ({
      timer,
      isRunning: !isLoading && timer !== null && remainingMs > 0,
      remainingMs,
      startChallenge,
      leaveChallenge,
      reportAttemptRecorded,
      refreshTimer,
    }),
    [timer, isLoading, remainingMs, startChallenge, leaveChallenge, reportAttemptRecorded, refreshTimer]
  );

  return <ChallengeTimerContext.Provider value={value}>{children}</ChallengeTimerContext.Provider>;
}

export function useChallengeTimer() {
  const context = useContext(ChallengeTimerContext);
  if (!context) {
    throw new Error('useChallengeTimer must be used within a ChallengeTimerProvider');
  }
  return context;
}
