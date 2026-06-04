import type { ChallengeTimerState } from '@/constants/challenge-timer';
import { LEADERBOARD_STORAGE_KEY, type LeaderboardEntry } from '@/constants/leaderboard';
import type { UserProfile, YearLevel } from '@/constants/user-profile';

import { getDatabase } from './database';

export async function loadUserProfile(): Promise<{
  profile: UserProfile | null;
  onboardingComplete: boolean;
}> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    team_name: string;
    first_name: string;
    year_level: string;
    onboarding_complete: number;
  }>('SELECT team_name, first_name, year_level, onboarding_complete FROM user_profile WHERE id = 1');

  if (!row) {
    return { profile: null, onboardingComplete: false };
  }

  return {
    profile: {
      teamName: row.team_name,
      firstName: row.first_name,
      yearLevel: row.year_level as YearLevel,
    },
    onboardingComplete: row.onboarding_complete === 1,
  };
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO user_profile (id, team_name, first_name, year_level, onboarding_complete)
     VALUES (1, ?, ?, ?, 1)`,
    [profile.teamName, profile.firstName, profile.yearLevel]
  );
}

export async function getActivityRating(activityKey: string): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ rating: number }>(
    'SELECT rating FROM activity_ratings WHERE activity_key = ?',
    [activityKey]
  );
  return row?.rating ?? 0;
}

export async function getAllActivityRatings(): Promise<Record<string, number>> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ activity_key: string; rating: number }>(
    'SELECT activity_key, rating FROM activity_ratings'
  );
  return Object.fromEntries(rows.map((row) => [row.activity_key, row.rating]));
}

export async function setActivityRating(activityKey: string, rating: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO activity_ratings (activity_key, rating) VALUES (?, ?)',
    [activityKey, rating]
  );
}

export async function loadActivityAttempts<T>(activityKey: string): Promise<T[]> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ attempts_json: string }>(
    'SELECT attempts_json FROM activity_attempts WHERE activity_key = ?',
    [activityKey]
  );
  if (!row?.attempts_json) {
    return [];
  }
  try {
    return JSON.parse(row.attempts_json) as T[];
  } catch {
    return [];
  }
}

export async function saveActivityAttempts(activityKey: string, attempts: unknown[]): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO activity_attempts (activity_key, attempts_json) VALUES (?, ?)',
    [activityKey, JSON.stringify(attempts)]
  );
}

export async function getActivityAttemptCount(activityKey: string): Promise<number> {
  const attempts = await loadActivityAttempts(activityKey);
  return attempts.length;
}

export async function loadRecordResultsDraftJson<T>(activityKey: string): Promise<T | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ draft_json: string }>(
    'SELECT draft_json FROM record_results_drafts WHERE activity_key = ?',
    [activityKey]
  );
  if (!row?.draft_json) {
    return null;
  }
  try {
    return JSON.parse(row.draft_json) as T;
  } catch {
    return null;
  }
}

export async function saveRecordResultsDraftJson(
  activityKey: string,
  draft: unknown
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO record_results_drafts (activity_key, draft_json) VALUES (?, ?)',
    [activityKey, JSON.stringify(draft)]
  );
}

export async function clearRecordResultsDraft(activityKey: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM record_results_drafts WHERE activity_key = ?', [activityKey]);
}

export async function loadLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{
    id: string;
    team: string;
    name: string;
    points: number;
  }>('SELECT id, team, name, points FROM leaderboard_entries ORDER BY points DESC, team ASC');
  return rows.map((row) => ({
    id: row.id,
    team: row.team,
    name: row.name,
    points: row.points,
  }));
}

export async function saveLeaderboardEntries(entries: LeaderboardEntry[]): Promise<void> {
  const db = await getDatabase();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM leaderboard_entries');
    for (const entry of entries) {
      await db.runAsync(
        'INSERT INTO leaderboard_entries (id, team, name, points) VALUES (?, ?, ?, ?)',
        [entry.id, entry.team, entry.name, entry.points]
      );
    }
  });
}

export async function loadChallengeTimer(): Promise<ChallengeTimerState | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ timer_json: string | null }>(
    'SELECT timer_json FROM challenge_timer WHERE id = 1'
  );
  if (!row?.timer_json) {
    return null;
  }
  try {
    return JSON.parse(row.timer_json) as ChallengeTimerState;
  } catch {
    return null;
  }
}

export async function saveChallengeTimer(state: ChallengeTimerState): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('INSERT OR REPLACE INTO challenge_timer (id, timer_json) VALUES (1, ?)', [
    JSON.stringify(state),
  ]);
}

export async function clearChallengeTimer(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE challenge_timer SET timer_json = NULL WHERE id = 1');
}
