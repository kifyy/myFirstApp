import type { LeaderboardEntry } from '@/constants/leaderboard';

export function sortLeaderboardEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.points - a.points || a.team.localeCompare(b.team));
}
