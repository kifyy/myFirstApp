import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { useChallengeTimer } from '@/contexts/challenge-timer-context';
import { useAppTheme } from '@/hooks/use-app-theme';

export default function RecordResultsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { reportAttemptRecorded } = useChallengeTimer();

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
  const [test1, setTest1] = useState('');
  const [test2, setTest2] = useState('');
  const [test3, setTest3] = useState('');
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      const attempt = {
        test1,
        test2,
        test3,
        uploadedVideo,
        location,
        createdAt: new Date().toISOString(),
      };
      const saved = await AsyncStorage.getItem('activity-1-attempts');
      const attempts = saved ? (JSON.parse(saved) as Array<{
        test1: string;
        test2: string;
        test3: string;
        createdAt: string;
        uploadedVideo?: string | null;
        location?: { latitude: number; longitude: number; accuracy: number } | null;
      }>) : [];
      attempts.push(attempt);
      await AsyncStorage.setItem('activity-1-attempts', JSON.stringify(attempts));
      await reportAttemptRecorded('activity-1');
      router.back();
    } catch (error) {
      console.error('Error saving attempt:', error);
      router.back();
    }
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
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude, accuracy: loc.coords.accuracy || 0 });
    } catch (error) {
      setLocationError('Failed to get location');
      console.error('Error getting location:', error);
    }
  };

  return (
    <AppScreen style={styles.container}>
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
        style={({ pressed }) => [styles.uploadButton, themed.uploadButton, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={[styles.uploadButtonText, themed.uploadButtonText]}>📹 Attach Video</Text>
      </Pressable>
      {uploadedVideo && (
        <ThemedText style={[styles.uploadedFileName, themed.uploadedFileName]}>✓ {uploadedVideo}</ThemedText>
      )}

      <Pressable
        onPress={handleTagLocation}
        style={({ pressed }) => [styles.locationButton, themed.locationButton, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={[styles.locationButtonText, themed.locationButtonText]}>📍 Tag Location</Text>
      </Pressable>
      {location && (
        <ThemedText style={styles.locationText}>
          Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)} (±{Math.round(location.accuracy)} m)
        </ThemedText>
      )}
      {locationError && (
        <ThemedText style={[styles.locationError, themed.locationError]}>{locationError}</ThemedText>
      )}

      <Pressable
        onPress={handleSubmit}
        style={({ pressed }) => [styles.submitButton, themed.submitButton, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={[styles.submitButtonText, themed.submitButtonText]}>Save Results</Text>
      </Pressable>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [styles.cancelButton, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={[styles.cancelButtonText, themed.cancelButtonText]}>Cancel</Text>
      </Pressable>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
  },
  header: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
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
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadedFileName: {
    fontSize: 14,
    marginBottom: 12,
  },
  locationButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  locationButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationText: {
    fontSize: 14,
    marginBottom: 12,
  },
  locationError: {
    fontSize: 14,
    marginBottom: 12,
  },
});
