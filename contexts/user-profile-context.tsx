import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  ONBOARDING_COMPLETE_KEY,
  USER_PROFILE_STORAGE_KEY,
  type UserProfile,
} from '@/constants/user-profile';

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
      const [storedProfile, onboardingFlag] = await Promise.all([
        AsyncStorage.getItem(USER_PROFILE_STORAGE_KEY),
        AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
      ]);

      setProfile(storedProfile ? (JSON.parse(storedProfile) as UserProfile) : null);
      setIsOnboardingComplete(onboardingFlag === 'true');
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

  const saveProfile = useCallback(async (nextProfile: UserProfile) => {
    await AsyncStorage.multiSet([
      [USER_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile)],
      [ONBOARDING_COMPLETE_KEY, 'true'],
    ]);
    setProfile(nextProfile);
    setIsOnboardingComplete(true);
  }, []);

  const value = useMemo(
    () => ({
      profile,
      isOnboardingComplete,
      isLoading,
      saveProfile,
      refreshProfile,
    }),
    [profile, isOnboardingComplete, isLoading, saveProfile, refreshProfile]
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
