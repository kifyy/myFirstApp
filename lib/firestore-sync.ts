import {
  ensureMockActivityRatingsSeeded,
  loadActivityRatingsFromFirestore,
} from '@/lib/firestore-activity-ratings';
import {
  ensureMockLeaderboardSeeded,
  loadLeaderboardFromFirestore,
} from '@/lib/firestore-leaderboard';
import { saveActivityAverageRatings, saveLeaderboardEntries } from '@/lib/db';

/** Seed mock data, fetch from Firestore, cache locally. SQLite writes run sequentially. */
export async function syncFirestoreOnLogin(): Promise<void> {
  await Promise.all([ensureMockLeaderboardSeeded(), ensureMockActivityRatingsSeeded()]);

  const [leaderboardEntries, activityRatings] = await Promise.all([
    loadLeaderboardFromFirestore(),
    loadActivityRatingsFromFirestore(),
  ]);

  await saveLeaderboardEntries(leaderboardEntries);
  await saveActivityAverageRatings(activityRatings);
}
