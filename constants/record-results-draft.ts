export const RECORD_RESULTS_DRAFT_KEY = 'activity-1-record-results-draft';

export type RecordResultsDraft = {
  test1: string;
  test2: string;
  test3: string;
  uploadedVideo: string | null;
  location: { latitude: number; longitude: number; accuracy: number } | null;
  locationError: string | null;
  attemptNumber: number;
};

export type RecordResultsFormFields = {
  test1: string;
  test2: string;
  test3: string;
  uploadedVideo: string | null;
  location: { latitude: number; longitude: number; accuracy: number } | null;
  locationError: string | null;
};
