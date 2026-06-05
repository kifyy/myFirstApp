import { setActivityRating, upsertActivityAverageRating } from '@/lib/db';
import { submitUserActivityRating } from '@/lib/firestore-activity-ratings';

export async function saveActivityUserRating(
  activityKey: string,
  rating: number,
  uid: string | null | undefined
): Promise<void> {
  await setActivityRating(activityKey, rating);

  if (!uid) {
    return;
  }

  try {
    const updatedAverage = await submitUserActivityRating(uid, activityKey, rating);
    await upsertActivityAverageRating(updatedAverage);
  } catch (error) {
    console.error('Error updating community activity rating:', error);
  }
}
