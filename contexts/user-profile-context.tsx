import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { UserProfile } from '@/constants/user-profile';
import { initDatabase, loadUserProfile, saveUserProfile } from '@/lib/db';

type UserProfileContextValue = {
  profile: UserProfile | null;
  isOnboardingComplete: boolean;
  isLoading: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextValue | null>(null);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      await initDatabase();
      const { profile: storedProfile, onboardingComplete } = await loadUserProfile();
      setProfile(storedProfile);
      setIsOnboardingComplete(onboardingComplete);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
      setIsOnboardingComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const saveProfileHandler = useCallback(async (nextProfile: UserProfile) => {
    await saveUserProfile(nextProfile);
    setProfile(nextProfile);
    setIsOnboardingComplete(true);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      isOnboardingComplete,
      isLoading,
      saveProfile: saveProfileHandler,
      refreshProfile,
    }),
    [profile, isOnboardingComplete, isLoading, saveProfileHandler, refreshProfile]
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
