import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import type { UserProfile } from '@/constants/user-profile';
import {
  clearUserProfile,
  initDatabase,
  saveUserProfile as saveLocalUserProfile,
} from '@/lib/db';
import { syncActivityRatingsOnLogin } from '@/lib/firestore-activity-ratings';
import { syncLeaderboardOnLogin } from '@/lib/firestore-leaderboard';
import { loadFirestoreUserProfile, saveFirestoreUserProfile } from '@/lib/firestore-profile';

type UserProfileContextValue = {
  profile: UserProfile | null;
  isOnboardingComplete: boolean;
  isLoading: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (authLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await initDatabase();

      if (!user) {
        await clearUserProfile();
        setProfile(null);
        setIsOnboardingComplete(false);
        return;
      }

      await Promise.all([syncLeaderboardOnLogin(), syncActivityRatingsOnLogin()]);

      const firestoreProfile = await loadFirestoreUserProfile(user.uid);
      if (firestoreProfile) {
        setProfile(firestoreProfile);
        setIsOnboardingComplete(true);
        await saveLocalUserProfile(firestoreProfile);
        return;
      }

      // Signed in but no Firestore profile yet — ignore stale pre-auth local data.
      await clearUserProfile();
      setProfile(null);
      setIsOnboardingComplete(false);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
      setIsOnboardingComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const saveProfileHandler = useCallback(
    async (nextProfile: UserProfile) => {
      if (!user?.email) {
        throw new Error('You must be signed in to save your profile.');
      }

      await saveFirestoreUserProfile(user.uid, user.email, nextProfile);
      await saveLocalUserProfile(nextProfile);
      setProfile(nextProfile);
      setIsOnboardingComplete(true);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      profile,
      isOnboardingComplete,
      isLoading: authLoading || isLoading,
      saveProfile: saveProfileHandler,
      refreshProfile,
    }),
    [profile, isOnboardingComplete, authLoading, isLoading, saveProfileHandler, refreshProfile]
  );

  return <UserProfileContext.Provider value={value}>{children}</UserProfileContext.Provider>;
}

export function useUserProfile() {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
}
