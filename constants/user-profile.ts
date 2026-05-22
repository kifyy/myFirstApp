export const ONBOARDING_COMPLETE_KEY = 'stemm-lab-onboarding-complete';
export const USER_PROFILE_STORAGE_KEY = 'stemm-lab-user-profile';

export const YEAR_LEVELS = ['Year 4', 'Year 5', 'Year 6', 'Year 7', 'Year 8'] as const;

export type YearLevel = (typeof YEAR_LEVELS)[number];

export type UserProfile = {
  teamName: string;
  firstName: string;
  yearLevel: YearLevel;
};
