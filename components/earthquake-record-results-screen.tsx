import * as DocumentPicker from 'expo-document-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { VibrateModeControl } from '@/components/vibrate-mode-control';
import {
  MAX_EARTHQUAKE_DESIGNS,
  createEmptyEarthquakeDesign,
  type EarthquakeActivityAttempt,
  type EarthquakeDesignFormEntry,
  type EarthquakeRecordResultsFormFields,
} from '@/constants/earthquake-attempt';
import { useChallengeTimer } from '@/contexts/challenge-timer-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { loadActivityAttempts, saveActivityAttempts } from '@/lib/db';
import { stopContinuousHaptics } from '@/lib/continuous-haptics';
import {
  clearEarthquakeRecordResultsDraft,
  earthquakeFormHasContent,
  getEarthquakeNextAttemptNumber,
  loadEarthquakeRecordResultsDraft,
  saveEarthquakeRecordResultsDraft,
} from '@/lib/earthquake-record-results-draft';
import { formatOneDecimal, parseOneDecimal } from '@/lib/measurement-input';

export function EarthquakeRecordResultsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { reportAttemptRecorded } = useChallengeTimer();
  const [designs, setDesigns] = useState<EarthquakeDesignFormEntry[]>([createEmptyEarthquakeDesign()]);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [vibratingDesignIndex, setVibratingDesignIndex] = useState<number | null>(null);

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
        addDesignButton: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
        addDesignButtonText: { color: colors.text },
        addDesignButtonDisabled: { backgroundColor: colors.disabled },
      }),
    [colors]
  );

  const formFields: EarthquakeRecordResultsFormFields = useMemo(
    () => ({ designs, uploadedVideo }),
    [designs, uploadedVideo]
  );

  const handleStopVibration = useCallback(() => {
    stopContinuousHaptics();
    setVibratingDesignIndex(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        handleStopVibration();
      };
    }, [handleStopVibration])
  );

  useFocusEffect(
    useCallback(() => {
      const loadDraft = async () => {
        const draft = await loadEarthquakeRecordResultsDraft();
        if (!draft) {
          return;
        }
        setDesigns(draft.designs.length > 0 ? draft.designs : [createEmptyEarthquakeDesign()]);
        setUploadedVideo(draft.uploadedVideo);
      };

      void loadDraft();
    }, [])
  );

  const updateDesign = (index: number, patch: Partial<EarthquakeDesignFormEntry>) => {
    setDesigns((current) =>
      current.map((design, designIndex) =>
        designIndex === index ? { ...design, ...patch } : design
      )
    );
  };

  const handleStartVibration = (index: number) => {
    handleStopVibration();
    setVibratingDesignIndex(index);
  };

  const handleVibrationStopped = (index: number, movementCm: number) => {
    updateDesign(index, { movementCm: formatOneDecimal(movementCm) });
    setVibratingDesignIndex(null);
  };

  const handleResetMovement = (index: number) => {
    if (vibratingDesignIndex === index) {
      handleStopVibration();
    }
    updateDesign(index, { movementCm: '' });
  };

  const handleAddDesign = () => {
    if (designs.length >= MAX_EARTHQUAKE_DESIGNS) {
      return;
    }
    setDesigns((current) => [...current, createEmptyEarthquakeDesign()]);
  };

  const handleSubmit = async () => {
    const savedDesigns = designs
      .map((design) => {
        const movementCm = parseOneDecimal(design.movementCm);
        const description = design.description.trim();
        if (!description || movementCm === null || movementCm <= 0) {
          return null;
        }
        return { description, movementCm };
      })
      .filter((design): design is { description: string; movementCm: number } => design !== null);

    if (savedDesigns.length === 0) {
      Alert.alert(
        'Missing measurements',
        'Describe each design and run vibrate mode to record movement before saving.'
      );
      return;
    }

    handleStopVibration();

    try {
      const attempt: EarthquakeActivityAttempt = {
        designs: savedDesigns,
        uploadedVideo,
        createdAt: new Date().toISOString(),
      };
      const attempts = await loadActivityAttempts<EarthquakeActivityAttempt>('activity-4');
      attempts.push(attempt);
      await saveActivityAttempts('activity-4', attempts);
      await clearEarthquakeRecordResultsDraft();
      await reportAttemptRecorded('activity-4');
      router.back();
    } catch (error) {
      console.error('Error saving earthquake attempt:', error);
      router.back();
    }
  };

  const handleBack = async () => {
    handleStopVibration();
    if (earthquakeFormHasContent(formFields)) {
      const attemptNumber = await getEarthquakeNextAttemptNumber();
      await saveEarthquakeRecordResultsDraft(formFields, attemptNumber);
    }
    router.back();
  };

  const handleCancel = () => {
    handleStopVibration();
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

  const canAddDesign = designs.length < MAX_EARTHQUAKE_DESIGNS;

  return (
    <AppScreen style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <ThemedText type="title" style={styles.header}>
          Record Results
        </ThemedText>

        {designs.map((design, index) => (
          <View key={index} style={styles.designBlock}>
            <ThemedText style={styles.sectionTitle}>Design {index + 1}</ThemedText>

            <ThemedText style={styles.label}>Describe Design {index + 1}</ThemedText>
            <TextInput
              value={design.description}
              onChangeText={(description) => updateDesign(index, { description })}
              placeholder="e.g. Folded cardboard with four pillars"
              multiline
              style={[styles.input, styles.textArea, themed.input]}
              placeholderTextColor={colors.placeholder}
            />

            <VibrateModeControl
              isActive={vibratingDesignIndex === index}
              movementCm={design.movementCm}
              onStart={() => handleStartVibration(index)}
              onStop={(movementCm) => handleVibrationStopped(index, movementCm)}
              onReset={() => handleResetMovement(index)}
            />
          </View>
        ))}

        <Pressable
          onPress={handleAddDesign}
          disabled={!canAddDesign}
          style={({ pressed }) => [
            styles.addDesignButton,
            canAddDesign ? themed.addDesignButton : themed.addDesignButtonDisabled,
            { opacity: pressed && canAddDesign ? 0.7 : 1 },
          ]}>
          <Text
            style={[
              styles.addDesignButtonText,
              themed.addDesignButtonText,
              !canAddDesign && { color: colors.surface },
            ]}>
            Add Design
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
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  designBlock: { marginBottom: 8 },
  addDesignButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  addDesignButtonText: { fontSize: 16, fontWeight: '600' },
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
});
