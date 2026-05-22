export const LEADERBOARD_STORAGE_KEY = 'stemm-lab-leaderboard';

export type LeaderboardEntry = {
  id: string;
  team: string;
  name: string;
  points: number;
};
