import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

import type { LeaderboardEntry } from '@/constants/leaderboard';
import {
  FIRESTORE_LEADERBOARD_COLLECTION,
  FIRESTORE_LEADERBOARD_META_COLLECTION,
  FIRESTORE_LEADERBOARD_META_ID,
} from '@/constants/firebase-config';
import { MOCK_LEADERBOARD_ENTRIES } from '@/constants/mock-leaderboard';
import { saveLeaderboardEntries } from '@/lib/db';
import { firestoreDb } from '@/lib/firebase';
import { sortLeaderboardEntries } from '@/lib/leaderboard-utils';

function leaderboardCollection() {
  return collection(firestoreDb, FIRESTORE_LEADERBOARD_COLLECTION);
}

function entryDocRef(entryId: string) {
  return doc(firestoreDb, FIRESTORE_LEADERBOARD_COLLECTION, entryId);
}

function parseLeaderboardEntry(id: string, data: Record<string, unknown>): LeaderboardEntry | null {
  const team = String(data.team ?? '').trim();
  const name = String(data.name ?? '').trim();
  const points = Number(data.points ?? 0);

  if (!team || !name || Number.isNaN(points)) {
    return null;
  }

  return { id, team, name, points };
}

export async function ensureMockLeaderboardSeeded(): Promise<void> {
  const metaRef = doc(firestoreDb, FIRESTORE_LEADERBOARD_META_COLLECTION, FIRESTORE_LEADERBOARD_META_ID);
  const metaSnapshot = await getDoc(metaRef);

  if (metaSnapshot.exists() && metaSnapshot.data()?.mockSeeded === true) {
    return;
  }

  const batch = writeBatch(firestoreDb);

  for (const entry of MOCK_LEADERBOARD_ENTRIES) {
    batch.set(
      entryDocRef(entry.id),
      {
        team: entry.team,
        name: entry.name,
        points: entry.points,
        isMock: true,
      },
      { merge: true }
    );
  }

  batch.set(
    metaRef,
    {
      mockSeeded: true,
      seededAt: new Date().toISOString(),
    },
    { merge: true }
  );

  await batch.commit();
}

export async function loadLeaderboardFromFirestore(): Promise<LeaderboardEntry[]> {
  const snapshot = await getDocs(leaderboardCollection());
  const entries: LeaderboardEntry[] = [];

  snapshot.forEach((docSnapshot) => {
    const parsed = parseLeaderboardEntry(docSnapshot.id, docSnapshot.data());
    if (parsed) {
      entries.push(parsed);
    }
  });

  return sortLeaderboardEntries(entries);
}

export async function saveLeaderboardToFirestore(entries: LeaderboardEntry[]): Promise<void> {
  const batch = writeBatch(firestoreDb);

  for (const entry of entries) {
    batch.set(
      entryDocRef(entry.id),
      {
        team: entry.team,
        name: entry.name,
        points: entry.points,
      },
      { merge: true }
    );
  }

  await batch.commit();
}

/** Seed mock players if needed, fetch Firestore leaderboard, cache locally. */
export async function syncLeaderboardOnLogin(): Promise<LeaderboardEntry[]> {
  await ensureMockLeaderboardSeeded();
  const entries = await loadLeaderboardFromFirestore();
  await saveLeaderboardEntries(entries);
  return entries;
}
