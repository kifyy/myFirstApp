export type ActivityAverageRating = {
  activityKey: string;
  averageRating: number;
  ratingCount: number;
};

export const MOCK_ACTIVITY_AVERAGE_RATINGS: ActivityAverageRating[] = [
  { activityKey: 'activity-1', averageRating: 4.2, ratingCount: 18 },
  { activityKey: 'activity-2', averageRating: 3.8, ratingCount: 14 },
  { activityKey: 'activity-3', averageRating: 4.6, ratingCount: 22 },
  { activityKey: 'activity-4', averageRating: 3.5, ratingCount: 11 },
];
