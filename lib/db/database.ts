import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

import { ACTIVITIES } from '@/constants/activities';
import {
  getAttemptsStorageKey,
  getRecordResultsDraftKey,
  getRatingStorageKey,
} from '@/constants/activity-attempt';
import { CHALLENGE_TIMER_STORAGE_KEY } from '@/constants/challenge-timer';
import { LEADERBOARD_STORAGE_KEY, type LeaderboardEntry } from '@/constants/leaderboard';
import {
  ONBOARDING_COMPLETE_KEY,
  USER_PROFILE_STORAGE_KEY,
  type UserProfile,
} from '@/constants/user-profile';

const DB_NAME = 'stemm_lab.db';
const MIGRATION_FLAG = 'async_storage_migrated';

let databaseReady: Promise<SQLite.SQLiteDatabase> | null = null;

const SCHEMA_SQL = `
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_profile (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    team_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    year_level TEXT NOT NULL,
    onboarding_complete INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS activity_ratings (
    activity_key TEXT PRIMARY KEY NOT NULL,
    rating INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS activity_attempts (
    activity_key TEXT PRIMARY KEY NOT NULL,
    attempts_json TEXT NOT NULL DEFAULT '[]'
  );
  CREATE TABLE IF NOT EXISTS record_results_drafts (
    activity_key TEXT PRIMARY KEY NOT NULL,
    draft_json TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id TEXT PRIMARY KEY NOT NULL,
    team TEXT NOT NULL,
    name TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS challenge_timer (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    timer_json TEXT
  );
`;

async function migrateFromAsyncStorageIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  const migrated = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ?',
    [MIGRATION_FLAG]
  );
  if (migrated?.value === 'true') {
    return;
  }

  const storedProfile = await AsyncStorage.getItem(USER_PROFILE_STORAGE_KEY);
  const onboardingFlag = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
  if (storedProfile) {
    const profile = JSON.parse(storedProfile) as UserProfile;
    await db.runAsync(
      `INSERT OR REPLACE INTO user_profile (id, team_name, first_name, year_level, onboarding_complete)
       VALUES (1, ?, ?, ?, ?)`,
      [profile.teamName, profile.firstName, profile.yearLevel, onboardingFlag === 'true' ? 1 : 0]
    );
  }

  for (const activity of ACTIVITIES) {
    const rating = await AsyncStorage.getItem(getRatingStorageKey(activity.key));
    if (rating) {
      await db.runAsync(
        'INSERT OR REPLACE INTO activity_ratings (activity_key, rating) VALUES (?, ?)',
        [activity.key, parseInt(rating, 10)]
      );
    }

    const attempts = await AsyncStorage.getItem(getAttemptsStorageKey(activity.key));
    if (attempts) {
      await db.runAsync(
        'INSERT OR REPLACE INTO activity_attempts (activity_key, attempts_json) VALUES (?, ?)',
        [activity.key, attempts]
      );
    }

    const draft = await AsyncStorage.getItem(getRecordResultsDraftKey(activity.key));
    if (draft) {
      await db.runAsync(
        'INSERT OR REPLACE INTO record_results_drafts (activity_key, draft_json) VALUES (?, ?)',
        [activity.key, draft]
      );
    }
  }

  const leaderboard = await AsyncStorage.getItem(LEADERBOARD_STORAGE_KEY);
  if (leaderboard) {
    const entries = JSON.parse(leaderboard) as LeaderboardEntry[];
    for (const entry of entries) {
      await db.runAsync(
        'INSERT OR REPLACE INTO leaderboard_entries (id, team, name, points) VALUES (?, ?, ?, ?)',
        [entry.id, entry.team, entry.name, entry.points]
      );
    }
  }

  const timer = await AsyncStorage.getItem(CHALLENGE_TIMER_STORAGE_KEY);
  if (timer) {
    await db.runAsync('INSERT OR REPLACE INTO challenge_timer (id, timer_json) VALUES (1, ?)', [timer]);
  }

  await db.runAsync(
    'INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [MIGRATION_FLAG, 'true']
  );
}

async function setupDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);
  await db.execAsync(SCHEMA_SQL);
  await migrateFromAsyncStorageIfNeeded(db);
  return db;
}

export function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databaseReady) {
    databaseReady = setupDatabase();
  }
  return databaseReady;
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return initDatabase();
}
