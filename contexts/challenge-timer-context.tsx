import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

import {
  CHALLENGE_DURATION_MS,
  CHALLENGE_TIMER_STORAGE_KEY,
  type ChallengeTimerState,
} from '@/constants/challenge-timer';
import {
  dismissChallengeCountdownNotification,
  showChallengeCountdownNotification,
  updateChallengeCountdownNotification,
} from '@/lib/challenge-countdown-notification';
import { notifyChallengeStarted } from '@/lib/challenge-notifications';
type ChallengeTimerContextValue = {
  timer: ChallengeTimerState | null;
  isRunning: boolean;
  remainingMs: number;
  startChallenge: (activityKey: string, activityTitle: string) => Promise<void>;
  leaveChallenge: () => Promise<void>;
  refreshTimer: () => Promise<void>;
};

const ChallengeTimerContext = createContext<ChallengeTimerContextValue | null>(null);

function getRemainingMs(endsAt: number): number {
  return Math.max(0, endsAt - Date.now());
}

function normalizeTimerState(raw: ChallengeTimerState): ChallengeTimerState {
  const endsAt = raw.endsAt ?? raw.startedAt + CHALLENGE_DURATION_MS;
  return { ...raw, endsAt };
}

export function ChallengeTimerProvider({ children }: { children: React.ReactNode }) {
  const [timer, setTimer] = useState<ChallengeTimerState | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const syncRemaining = useCallback((state: ChallengeTimerState | null) => {
    if (!state) {
      setRemainingMs(0);
      return 0;
    }
    const remaining = getRemainingMs(state.endsAt);
    setRemainingMs(remaining);
    return remaining;
  }, []);

  const clearChallenge = useCallback(async () => {
    await AsyncStorage.removeItem(CHALLENGE_TIMER_STORAGE_KEY);
    await dismissChallengeCountdownNotification();
    setTimer(null);
    syncRemaining(null);
  }, [syncRemaining]);

  const refreshTimer = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(CHALLENGE_TIMER_STORAGE_KEY);
      if (!stored) {
        setTimer(null);
        syncRemaining(null);
        return;
      }

      const parsed = normalizeTimerState(JSON.parse(stored) as ChallengeTimerState);
      const remaining = getRemainingMs(parsed.endsAt);

      if (remaining <= 0) {
        await clearChallenge();
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
  }, [clearChallenge, syncRemaining]);

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
        await clearChallenge();
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
  }, [timer, syncRemaining, clearChallenge]);

  const startChallenge = useCallback(
    async (activityKey: string, activityTitle: string) => {
      const startedAt = Date.now();
      const nextTimer: ChallengeTimerState = {
        activityKey,
        activityTitle,
        startedAt,
        endsAt: startedAt + CHALLENGE_DURATION_MS,
      };

      await AsyncStorage.setItem(CHALLENGE_TIMER_STORAGE_KEY, JSON.stringify(nextTimer));
      setTimer(nextTimer);
      syncRemaining(nextTimer);
      await notifyChallengeStarted(activityTitle);
      await showChallengeCountdownNotification(activityTitle, CHALLENGE_DURATION_MS);
    },
    [syncRemaining]
  );

  const leaveChallenge = useCallback(async () => {
    await clearChallenge();
  }, [clearChallenge]);

  const value = useMemo(
    () => ({
      timer,
      isRunning: !isLoading && timer !== null && remainingMs > 0,
      remainingMs,
      startChallenge,
      leaveChallenge,
      refreshTimer,
    }),
    [timer, isLoading, remainingMs, startChallenge, leaveChallenge, refreshTimer]
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
