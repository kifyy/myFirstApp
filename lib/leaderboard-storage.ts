import AsyncStorage from '@react-native-async-storage/async-storage';

import { LEADERBOARD_STORAGE_KEY, type LeaderboardEntry } from '@/constants/leaderboard';
import type { UserProfile } from '@/constants/user-profile';

export function getLeaderboardEntryId(profile: UserProfile): string {
  return `${profile.teamName.trim().toLowerCase()}::${profile.firstName.trim().toLowerCase()}`;
}

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const stored = await AsyncStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored) as LeaderboardEntry[];
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }
}

export async function saveLeaderboard(entries: LeaderboardEntry[]): Promise<void> {
  await AsyncStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries));
}

export async function addLeaderboardPoint(profile: UserProfile): Promise<LeaderboardEntry[]> {
  const entries = await loadLeaderboard();
  const id = getLeaderboardEntryId(profile);
  const existing = entries.find((entry) => entry.id === id);

  if (existing) {
    existing.points += 1;
  } else {
    entries.push({
      id,
      team: profile.teamName,
      name: profile.firstName,
      points: 1,
    });
  }

  const sorted = [...entries].sort((a, b) => b.points - a.points || a.team.localeCompare(b.team));
  await saveLeaderboard(sorted);
  return sorted;
}

export function sortLeaderboardEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.points - a.points || a.team.localeCompare(b.team));
}
