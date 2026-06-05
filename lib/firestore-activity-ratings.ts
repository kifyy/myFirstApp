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
  FIRESTORE_ACTIVITY_USER_RATINGS_COLLECTION,
} from '@/constants/firebase-config';
import { MOCK_ACTIVITY_AVERAGE_RATINGS } from '@/constants/mock-activity-ratings';
import { saveActivityAverageRatings } from '@/lib/db';
import { firestoreDb } from '@/lib/firebase';
import { computeUpdatedAverage, roundToOneDecimal } from '@/lib/rating-utils';

function userActivityRatingDocId(uid: string, activityKey: string): string {
  return `${uid}__${activityKey}`;
}

function userActivityRatingDocRef(uid: string, activityKey: string) {
  return doc(
    firestoreDb,
    FIRESTORE_ACTIVITY_USER_RATINGS_COLLECTION,
    userActivityRatingDocId(uid, activityKey)
  );
}

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

export async function submitUserActivityRating(
  uid: string,
  activityKey: string,
  rating: number
): Promise<ActivityAverageRating> {
  const [aggregateSnapshot, userRatingSnapshot] = await Promise.all([
    getDoc(activityRatingDocRef(activityKey)),
    getDoc(userActivityRatingDocRef(uid, activityKey)),
  ]);

  const aggregateData = aggregateSnapshot.data() ?? {};
  const currentAverage = Number(aggregateData.averageRating ?? 0);
  const currentCount = Number(aggregateData.ratingCount ?? 0);
  const previousUserRating = userRatingSnapshot.exists()
    ? Number(userRatingSnapshot.data()?.rating ?? 0)
    : null;

  const { averageRating, ratingCount } = computeUpdatedAverage(
    currentAverage,
    currentCount,
    rating,
    previousUserRating
  );

  const batch = writeBatch(firestoreDb);

  batch.set(
    userActivityRatingDocRef(uid, activityKey),
    {
      uid,
      activityKey,
      rating,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  batch.set(
    activityRatingDocRef(activityKey),
    {
      averageRating,
      ratingCount,
    },
    { merge: true }
  );

  await batch.commit();

  return { activityKey, averageRating, ratingCount };
}
