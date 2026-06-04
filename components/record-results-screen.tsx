import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { type ActivityKey } from '@/constants/activity-content';
import { type ActivityAttempt } from '@/constants/activity-attempt';
import { loadActivityAttempts, saveActivityAttempts } from '@/lib/db';
import { useChallengeTimer } from '@/contexts/challenge-timer-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
  clearRecordResultsDraft,
  formHasContent,
  getNextAttemptNumber,
  loadRecordResultsDraft,
  saveRecordResultsDraft,
} from '@/lib/record-results-draft';

type RecordResultsScreenProps = {
  activityKey: ActivityKey;
};

export function RecordResultsScreen({ activityKey }: RecordResultsScreenProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { reportAttemptRecorded } = useChallengeTimer();
  const [test1, setTest1] = useState('');
  const [test2, setTest2] = useState('');
  const [test3, setTest3] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const themed = useMemo(
    () =>
      StyleSheet.create({
        input: {
          borderColor: colors.borderStrong,
          backgroundColor: colors.inputBackground,
          color: colors.text,
        },
        submitButton: { backgroundColor: colors.tint },
        submitButtonText: { color: colors.onTint },
        backButton: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
        backButtonText: { color: colors.text },
        cancelButtonText: { color: colors.tint },
        uploadButton: { backgroundColor: colors.tint },
        uploadButtonText: { color: colors.onTint },
        uploadedFileName: { color: colors.success },
        locationButton: { backgroundColor: colors.success },
        locationButtonText: { color: colors.onTint },
        locationError: { color: colors.danger },
      }),
    [colors]
  );

  const formFields = useMemo(
    () => ({ test1, test2, test3, uploadedVideo, location, locationError }),
    [test1, test2, test3, uploadedVideo, location, locationError]
  );

  useFocusEffect(
    useCallback(() => {
      const loadDraft = async () => {
        const draft = await loadRecordResultsDraft(activityKey);
        if (!draft) {
          return;
        }
        setTest1(draft.test1);
        setTest2(draft.test2);
        setTest3(draft.test3);
        setUploadedVideo(draft.uploadedVideo);
        setLocation(draft.location);
        setLocationError(draft.locationError);
      };

      void loadDraft();
    }, [activityKey])
  );

  const handleSubmit = async () => {
    try {
      const attempt: ActivityAttempt = {
        test1,
        test2,
        test3,
        uploadedVideo,
        location,
        createdAt: new Date().toISOString(),
      };
      const attempts = await loadActivityAttempts<ActivityAttempt>(activityKey);
      attempts.push(attempt);
      await saveActivityAttempts(activityKey, attempts);
      await clearRecordResultsDraft(activityKey);
      await reportAttemptRecorded(activityKey);
      router.back();
    } catch (error) {
      console.error('Error saving attempt:', error);
      router.back();
    }
  };

  const handleBack = async () => {
    if (formHasContent(formFields)) {
      const attemptNumber = await getNextAttemptNumber(activityKey);
      await saveRecordResultsDraft(activityKey, formFields, attemptNumber);
    }
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  const handleUploadVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadedVideo(result.assets[0].name || 'Video selected');
      }
    } catch (error) {
      console.error('Error picking video:', error);
    }
  };

  const handleTagLocation = async () => {
    try {
      setLocationError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy || 0,
      });
    } catch (error) {
      setLocationError('Failed to get location');
      console.error('Error getting location:', error);
    }
  };

  return (
    <AppScreen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ThemedText type="title" style={styles.header}>
          Record Results
        </ThemedText>

        <ThemedText style={styles.label}>Test 1 Result</ThemedText>
        <TextInput
          value={test1}
          onChangeText={setTest1}
          placeholder="Enter Test 1 result"
          style={[styles.input, themed.input]}
          placeholderTextColor={colors.placeholder}
        />

        <ThemedText style={styles.label}>Test 2 Result</ThemedText>
        <TextInput
          value={test2}
          onChangeText={setTest2}
          placeholder="Enter Test 2 result"
          style={[styles.input, themed.input]}
          placeholderTextColor={colors.placeholder}
        />

        <ThemedText style={styles.label}>Test 3 Result</ThemedText>
        <TextInput
          value={test3}
          onChangeText={setTest3}
          placeholder="Enter Test 3 result"
          style={[styles.input, themed.input]}
          placeholderTextColor={colors.placeholder}
        />

        <Pressable
          onPress={handleUploadVideo}
          style={({ pressed }) => [styles.uploadButton, themed.uploadButton, { opacity: pressed ? 0.7 : 1 }]}>
          <Text style={[styles.uploadButtonText, themed.uploadButtonText]}>📹 Attach Video</Text>
        </Pressable>
        {uploadedVideo ? (
          <ThemedText style={[styles.uploadedFileName, themed.uploadedFileName]}>
            ✓ {uploadedVideo}
          </ThemedText>
        ) : null}

        <Pressable
          onPress={handleTagLocation}
          style={({ pressed }) => [styles.locationButton, themed.locationButton, { opacity: pressed ? 0.7 : 1 }]}>
          <Text style={[styles.locationButtonText, themed.locationButtonText]}>📍 Tag Location</Text>
        </Pressable>
        {location ? (
          <ThemedText style={styles.locationText}>
            Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} (±
            {Math.round(location.accuracy)} m)
          </ThemedText>
        ) : null}
        {locationError ? (
          <ThemedText style={[styles.locationError, themed.locationError]}>{locationError}</ThemedText>
        ) : null}

        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [styles.submitButton, themed.submitButton, { opacity: pressed ? 0.7 : 1 }]}>
          <Text style={[styles.submitButtonText, themed.submitButtonText]}>Save Results</Text>
        </Pressable>

        <View style={styles.footerRow}>
          <Pressable
            onPress={() => {
              void handleBack();
            }}
            style={({ pressed }) => [
              styles.footerButton,
              themed.backButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <Text style={[styles.footerButtonText, themed.backButtonText]}>Back</Text>
          </Pressable>
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [styles.footerButton, { opacity: pressed ? 0.7 : 1 }]}>
            <Text style={[styles.footerButtonText, themed.cancelButtonText]}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 24 },
  label: { fontSize: 16, marginBottom: 8, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: { fontSize: 16, fontWeight: '600' },
  footerRow: { flexDirection: 'row', gap: 12 },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  footerButtonText: { fontSize: 16, fontWeight: '600' },
  uploadButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadButtonText: { fontSize: 16, fontWeight: '600' },
  uploadedFileName: { fontSize: 14, marginBottom: 12 },
  locationButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  locationButtonText: { fontSize: 16, fontWeight: '600' },
  locationText: { fontSize: 14, marginBottom: 12 },
  locationError: { fontSize: 14, marginBottom: 12 },
});
