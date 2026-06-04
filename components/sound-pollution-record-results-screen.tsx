import * as DocumentPicker from 'expo-document-picker';
import * as Location from 'expo-location';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { DecibelRecorder } from '@/components/decibel-recorder';
import { SoundZoneMap } from '@/components/sound-zone-map';
import { ThemedText } from '@/components/themed-text';
import { loadActivityAttempts, saveActivityAttempts } from '@/lib/db';
import {
  MAX_SOUND_ACTIONS,
  createEmptySoundAction,
  type SoundActionFormEntry,
  type SoundPollutionActivityAttempt,
  type SoundPollutionRecordResultsFormFields,
} from '@/constants/sound-pollution-attempt';
import { useChallengeTimer } from '@/contexts/challenge-timer-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { parseOneDecimal } from '@/lib/measurement-input';
import {
  clearSoundPollutionRecordResultsDraft,
  getSoundPollutionNextAttemptNumber,
  loadSoundPollutionRecordResultsDraft,
  saveSoundPollutionRecordResultsDraft,
  soundPollutionFormHasContent,
} from '@/lib/sound-pollution-record-results-draft';

export function SoundPollutionRecordResultsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { reportAttemptRecorded } = useChallengeTimer();
  const [actions, setActions] = useState<SoundActionFormEntry[]>([createEmptySoundAction()]);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

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
        addActionButton: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
        addActionButtonText: { color: colors.text },
        addActionButtonDisabled: { backgroundColor: colors.disabled },
      }),
    [colors]
  );

  const formFields: SoundPollutionRecordResultsFormFields = useMemo(
    () => ({ actions, uploadedVideo }),
    [actions, uploadedVideo]
  );

  useFocusEffect(
    useCallback(() => {
      const loadDraft = async () => {
        const draft = await loadSoundPollutionRecordResultsDraft();
        if (!draft) {
          return;
        }
        setActions(draft.actions.length > 0 ? draft.actions : [createEmptySoundAction()]);
        setUploadedVideo(draft.uploadedVideo);
      };

      void loadDraft();
    }, [])
  );

  const updateAction = (index: number, patch: Partial<SoundActionFormEntry>) => {
    setActions((current) =>
      current.map((action, actionIndex) =>
        actionIndex === index ? { ...action, ...patch } : action
      )
    );
  };

  const handleTagLocation = async (index: number) => {
    try {
      updateAction(index, { locationError: null });
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        updateAction(index, { locationError: 'Location permission denied' });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const tagged = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy || 0,
      };
      const radiusM = parseOneDecimal(actions[index]?.zoneRadiusM) ?? 10;
      updateAction(index, {
        location: tagged,
        soundZone: {
          latitude: tagged.latitude,
          longitude: tagged.longitude,
          radiusM,
        },
      });
    } catch (error) {
      updateAction(index, { locationError: 'Failed to get location' });
      console.error('Error getting location:', error);
    }
  };

  const handleAddAction = () => {
    if (actions.length >= MAX_SOUND_ACTIONS) {
      return;
    }
    setActions((current) => [...current, createEmptySoundAction()]);
  };

  const handleSubmit = async () => {
    const savedActions = actions
      .filter((action) => action.loudestDb !== null)
      .map((action) => ({
        loudestDb: action.loudestDb as number,
        howMade: action.howMade.trim(),
        location: action.location,
        soundZone: action.soundZone,
      }));

    if (savedActions.length === 0) {
      Alert.alert('Missing measurements', 'Record at least one action noise level before saving.');
      return;
    }

    try {
      const attempt: SoundPollutionActivityAttempt = {
        actions: savedActions,
        uploadedVideo,
        createdAt: new Date().toISOString(),
      };
      const attempts = await loadActivityAttempts<SoundPollutionActivityAttempt>('activity-2');
      attempts.push(attempt);
      await saveActivityAttempts('activity-2', attempts);
      await clearSoundPollutionRecordResultsDraft();
      await reportAttemptRecorded('activity-2');
      router.back();
    } catch (error) {
      console.error('Error saving sound pollution attempt:', error);
      router.back();
    }
  };

  const handleBack = async () => {
    if (soundPollutionFormHasContent(formFields)) {
      const attemptNumber = await getSoundPollutionNextAttemptNumber();
      await saveSoundPollutionRecordResultsDraft(formFields, attemptNumber);
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

  const canAddAction = actions.length < MAX_SOUND_ACTIONS;

  return (
    <AppScreen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ThemedText type="title" style={styles.header}>
          Record Results
        </ThemedText>

        {actions.map((action, index) => (
          <View key={index} style={styles.actionBlock}>
            <ThemedText style={styles.sectionTitle}>Action {index + 1}</ThemedText>

            <ThemedText style={styles.label}>Measure the Action noise in decibels (dB)</ThemedText>
            <DecibelRecorder
              value={action.loudestDb}
              onChange={(loudestDb) => updateAction(index, { loudestDb })}
            />

            <ThemedText style={styles.label}>How did you make the sound?</ThemedText>
            <TextInput
              value={action.howMade}
              onChangeText={(howMade) => updateAction(index, { howMade })}
              placeholder="e.g. Dropped a book on the floor"
              style={[styles.input, themed.input]}
              placeholderTextColor={colors.placeholder}
            />

            <ThemedText style={styles.label}>Tag the sound location:</ThemedText>
            <Pressable
              onPress={() => {
                void handleTagLocation(index);
              }}
              style={({ pressed }) => [
                styles.locationButton,
                themed.locationButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <Text style={[styles.locationButtonText, themed.locationButtonText]}>
                📍 Tag Location
              </Text>
            </Pressable>
            {action.location ? (
              <ThemedText style={styles.locationText}>
                Location: {action.location.latitude.toFixed(6)}, {action.location.longitude.toFixed(6)}{' '}
                (±{Math.round(action.location.accuracy)} m)
              </ThemedText>
            ) : null}
            {action.locationError ? (
              <ThemedText style={[styles.locationError, themed.locationError]}>
                {action.locationError}
              </ThemedText>
            ) : null}

            <SoundZoneMap
              soundZone={action.soundZone}
              zoneRadiusM={action.zoneRadiusM}
              mapCenter={action.location}
              onSoundZoneChange={(soundZone) => updateAction(index, { soundZone })}
              onZoneRadiusChange={(zoneRadiusM) => updateAction(index, { zoneRadiusM })}
            />
          </View>
        ))}

        <Pressable
          onPress={handleAddAction}
          disabled={!canAddAction}
          style={({ pressed }) => [
            styles.addActionButton,
            canAddAction ? themed.addActionButton : themed.addActionButtonDisabled,
            { opacity: pressed && canAddAction ? 0.7 : 1 },
          ]}>
          <Text
            style={[
              styles.addActionButtonText,
              themed.addActionButtonText,
              !canAddAction && { color: colors.surface },
            ]}>
            Add Action
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
  actionBlock: { marginBottom: 8 },
  addActionButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  addActionButtonText: { fontSize: 16, fontWeight: '600' },
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
