export type ActivityAttempt = {
  test1: string;
  test2: string;
  test3: string;
  createdAt: string;
  uploadedVideo?: string | null;
  location?: { latitude: number; longitude: number; accuracy: number } | null;
};

export function getRatingStorageKey(activityKey: string): string {
  return `${activityKey}-rating`;
}

export function getAttemptsStorageKey(activityKey: string): string {
  return `${activityKey}-attempts`;
}

export function getRecordResultsDraftKey(activityKey: string): string {
  return `${activityKey}-record-results-draft`;
}
