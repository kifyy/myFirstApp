import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
} from 'firebase/firestore';

import type { ActivityAverageRating } from '@/constants/mock-activity-ratings';
import {
  FIRESTORE_ACTIVITY_RATINGS_COLLECTION,
  FIRESTORE_ACTIVITY_RATINGS_META_COLLECTION,
  FIRESTORE_ACTIVITY_RATINGS_META_ID,
} from '@/constants/firebase-config';
import { MOCK_ACTIVITY_AVERAGE_RATINGS } from '@/constants/mock-activity-ratings';
import { saveActivityAverageRatings } from '@/lib/db';
import { firestoreDb } from '@/lib/firebase';
import { roundToOneDecimal } from '@/lib/rating-utils';

function activityRatingsCollection() {
  return collection(firestoreDb, FIRESTORE_ACTIVITY_RATINGS_COLLECTION);
}

function activityRatingDocRef(activityKey: string) {
  return doc(firestoreDb, FIRESTORE_ACTIVITY_RATINGS_COLLECTION, activityKey);
}

function parseActivityAverageRating(
  activityKey: string,
  data: Record<string, unknown>
): ActivityAverageRating | null {
  const averageRating = Number(data.averageRating ?? 0);
  const ratingCount = Number(data.ratingCount ?? 0);

  if (!activityKey || Number.isNaN(averageRating) || Number.isNaN(ratingCount)) {
    return null;
  }

  return {
    activityKey,
    averageRating: roundToOneDecimal(averageRating),
    ratingCount,
  };
}

export async function ensureMockActivityRatingsSeeded(): Promise<void> {
  const metaRef = doc(
    firestoreDb,
    FIRESTORE_ACTIVITY_RATINGS_META_COLLECTION,
    FIRESTORE_ACTIVITY_RATINGS_META_ID
  );
  const metaSnapshot = await getDoc(metaRef);

  if (metaSnapshot.exists() && metaSnapshot.data()?.mockSeeded === true) {
    return;
  }

  const batch = writeBatch(firestoreDb);

  for (const entry of MOCK_ACTIVITY_AVERAGE_RATINGS) {
    batch.set(
      activityRatingDocRef(entry.activityKey),
      {
        averageRating: roundToOneDecimal(entry.averageRating),
        ratingCount: entry.ratingCount,
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

export async function loadActivityRatingsFromFirestore(): Promise<ActivityAverageRating[]> {
  const snapshot = await getDocs(activityRatingsCollection());
  const ratings: ActivityAverageRating[] = [];

  snapshot.forEach((docSnapshot) => {
    const parsed = parseActivityAverageRating(docSnapshot.id, docSnapshot.data());
    if (parsed) {
      ratings.push(parsed);
    }
  });

  return ratings;
}

/** Seed mock averages if needed, fetch from Firestore, cache locally. */
export async function syncActivityRatingsOnLogin(): Promise<ActivityAverageRating[]> {
  await ensureMockActivityRatingsSeeded();
  const ratings = await loadActivityRatingsFromFirestore();
  await saveActivityAverageRatings(ratings);
  return ratings;
}
