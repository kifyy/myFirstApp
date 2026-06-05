import type { LeaderboardEntry } from '@/constants/leaderboard';
import type { UserProfile } from '@/constants/user-profile';
import { loadLeaderboardEntries, saveLeaderboardEntries } from '@/lib/db';
import { notifyLeaderboardPointGained } from '@/lib/leaderboard-notifications';

export function getLeaderboardEntryId(profile: UserProfile): string {
  return `${profile.teamName.trim().toLowerCase()}::${profile.firstName.trim().toLowerCase()}`;
}

export async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    return await loadLeaderboardEntries();
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    return [];
  }
}

export async function saveLeaderboard(entries: LeaderboardEntry[]): Promise<void> {
  await saveLeaderboardEntries(entries);
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

  const sorted = sortLeaderboardEntries(entries);
  await saveLeaderboard(sorted);

  const updatedEntry = sorted.find((entry) => entry.id === id);
  if (updatedEntry) {
    await notifyLeaderboardPointGained(updatedEntry.points);
  }

  return sorted;
}

export function sortLeaderboardEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.points - a.points || a.team.localeCompare(b.team));
}
