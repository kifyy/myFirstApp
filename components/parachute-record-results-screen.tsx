import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { getAttemptsStorageKey } from '@/constants/activity-attempt';
import {
  MAX_PARACHUTE_TESTS,
  type ParachuteActivityAttempt,
  type ParachuteRecordResultsFormFields,
} from '@/constants/parachute-attempt';
import { useChallengeTimer } from '@/contexts/challenge-timer-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
  computeVelocityMs,
  formatVelocityEquation,
  parseOneDecimal,
  sanitizeDecimalInput,
} from '@/lib/measurement-input';
import {
  clearParachuteRecordResultsDraft,
  getParachuteNextAttemptNumber,
  loadParachuteRecordResultsDraft,
  parachuteFormHasContent,
  saveParachuteRecordResultsDraft,
} from '@/lib/parachute-record-results-draft';

function VelocityBox({
  label,
  equation,
  boxStyle,
  labelStyle,
}: {
  label: string;
  equation: string | null;
  boxStyle: object;
  labelStyle: object;
}) {
  return (
    <View style={styles.velocitySection}>
      <ThemedText style={[styles.label, labelStyle]}>{label}</ThemedText>
      <View style={[styles.velocityBox, boxStyle]}>
        <ThemedText style={styles.velocityText}>{equation ?? '—'}</ThemedText>
      </View>
    </View>
  );
}

export function ParachuteRecordResultsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { reportAttemptRecorded } = useChallengeTimer();
  const [dropHeight, setDropHeight] = useState('');
  const [baselineTime, setBaselineTime] = useState('');
  const [parachuteTimes, setParachuteTimes] = useState<string[]>(['']);
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
        velocityBox: {
          borderColor: colors.borderStrong,
          backgroundColor: colors.card,
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
        addParachuteButton: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
        addParachuteButtonText: { color: colors.text },
        addParachuteButtonDisabled: { backgroundColor: colors.disabled },
      }),
    [colors]
  );

  const formFields: ParachuteRecordResultsFormFields = useMemo(
    () => ({ dropHeight, baselineTime, parachuteTimes, uploadedVideo, location, locationError }),
    [dropHeight, baselineTime, parachuteTimes, uploadedVideo, location, locationError]
  );

  const dropHeightM = parseOneDecimal(dropHeight);
  const baselineTimeS = parseOneDecimal(baselineTime);

  const baselineEquation =
    dropHeightM !== null && baselineTimeS !== null && baselineTimeS > 0
      ? formatVelocityEquation(dropHeightM, baselineTimeS)
      : null;

  useFocusEffect(
    useCallback(() => {
      const loadDraft = async () => {
        const draft = await loadParachuteRecordResultsDraft();
        if (!draft) {
          return;
        }
        setDropHeight(draft.dropHeight);
        setBaselineTime(draft.baselineTime);
        setParachuteTimes(
          draft.parachuteTimes.length > 0 ? draft.parachuteTimes : ['']
        );
        setUploadedVideo(draft.uploadedVideo);
        setLocation(draft.location);
        setLocationError(draft.locationError);
      };

      void loadDraft();
    }, [])
  );

  const updateParachuteTime = (index: number, value: string) => {
    setParachuteTimes((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? sanitizeDecimalInput(value) : entry
      )
    );
  };

  const handleAddParachute = () => {
    if (parachuteTimes.length >= MAX_PARACHUTE_TESTS) {
      return;
    }
    setParachuteTimes((current) => [...current, '']);
  };

  const handleSubmit = async () => {
    if (dropHeightM === null || baselineTimeS === null || baselineTimeS <= 0) {
      Alert.alert(
        'Missing measurements',
        'Enter drop height and baseline time (greater than 0) before saving.'
      );
      return;
    }

    const baselineVelocityMs = computeVelocityMs(dropHeightM, baselineTimeS);
    if (baselineVelocityMs === null) {
      return;
    }

    const parachutes = parachuteTimes
      .map((timeValue) => parseOneDecimal(timeValue))
      .filter((timeS): timeS is number => timeS !== null && timeS > 0)
      .map((timeS) => ({
        timeS,
        velocityMs: computeVelocityMs(dropHeightM, timeS) ?? 0,
      }));

    try {
      const attempt: ParachuteActivityAttempt = {
        dropHeightM,
        baselineTimeS,
        baselineVelocityMs,
        parachutes,
        uploadedVideo,
        location,
        createdAt: new Date().toISOString(),
      };
      const saved = await AsyncStorage.getItem(getAttemptsStorageKey('activity-1'));
      const attempts = saved ? (JSON.parse(saved) as ParachuteActivityAttempt[]) : [];
      attempts.push(attempt);
      await AsyncStorage.setItem(
        getAttemptsStorageKey('activity-1'),
        JSON.stringify(attempts)
      );
      await clearParachuteRecordResultsDraft();
      await reportAttemptRecorded('activity-1');
      router.back();
    } catch (error) {
      console.error('Error saving parachute attempt:', error);
      router.back();
    }
  };

  const handleBack = async () => {
    if (parachuteFormHasContent(formFields)) {
      const attemptNumber = await getParachuteNextAttemptNumber();
      await saveParachuteRecordResultsDraft(formFields, attemptNumber);
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

  const canAddParachute = parachuteTimes.length < MAX_PARACHUTE_TESTS;

  return (
    <AppScreen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ThemedText type="title" style={styles.header}>
          Record Results
        </ThemedText>

        <ThemedText style={styles.label}>
          Measure the drop height (table height) in metres
        </ThemedText>
        <TextInput
          value={dropHeight}
          onChangeText={(text) => setDropHeight(sanitizeDecimalInput(text))}
          placeholder="e.g. 1.0"
          keyboardType="decimal-pad"
          style={[styles.input, themed.input]}
          placeholderTextColor={colors.placeholder}
        />

        <ThemedText style={styles.label}>Measure the time in seconds</ThemedText>
        <TextInput
          value={baselineTime}
          onChangeText={(text) => setBaselineTime(sanitizeDecimalInput(text))}
          placeholder="e.g. 0.5"
          keyboardType="decimal-pad"
          style={[styles.input, themed.input]}
          placeholderTextColor={colors.placeholder}
        />

        <VelocityBox
          label="Baseline Velocity"
          equation={baselineEquation}
          boxStyle={themed.velocityBox}
          labelStyle={styles.label}
        />

        {parachuteTimes.map((timeValue, index) => {
          const timeS = parseOneDecimal(timeValue);
          const parachuteEquation =
            dropHeightM !== null && timeS !== null && timeS > 0
              ? formatVelocityEquation(dropHeightM, timeS)
              : null;

          return (
            <View key={index} style={styles.parachuteBlock}>
              <ThemedText style={styles.sectionTitle}>Parachute {index + 1} Test</ThemedText>
              <ThemedText style={styles.label}>Time in seconds</ThemedText>
              <TextInput
                value={timeValue}
                onChangeText={(text) => updateParachuteTime(index, text)}
                placeholder="e.g. 1.2"
                keyboardType="decimal-pad"
                style={[styles.input, themed.input]}
                placeholderTextColor={colors.placeholder}
              />
              <VelocityBox
                label={`Parachute ${index + 1} Velocity`}
                equation={parachuteEquation}
                boxStyle={themed.velocityBox}
                labelStyle={styles.label}
              />
            </View>
          );
        })}

        <Pressable
          onPress={handleAddParachute}
          disabled={!canAddParachute}
          style={({ pressed }) => [
            styles.addParachuteButton,
            canAddParachute ? themed.addParachuteButton : themed.addParachuteButtonDisabled,
            { opacity: pressed && canAddParachute ? 0.7 : 1 },
          ]}>
          <Text
            style={[
              styles.addParachuteButtonText,
              themed.addParachuteButtonText,
              !canAddParachute && { color: colors.surface },
            ]}>
            Add Parachute
          </Text>
        </Pressable>

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
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  velocitySection: { marginBottom: 8 },
  velocityBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  velocityText: { fontSize: 16, fontWeight: '600' },
  parachuteBlock: { marginTop: 4 },
  addParachuteButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  addParachuteButtonText: { fontSize: 16, fontWeight: '600' },
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
