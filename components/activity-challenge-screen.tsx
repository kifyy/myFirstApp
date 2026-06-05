import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { EarthquakeAttemptSummary } from '@/components/earthquake-attempt-summary';
import { ParachuteAttemptSummary } from '@/components/parachute-attempt-summary';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { RecordResultsDraftBar } from '@/components/record-results-draft-bar';
import { SoundPollutionAttemptSummary } from '@/components/sound-pollution-attempt-summary';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { type ActivityAttempt } from '@/constants/activity-attempt';
import {
  ACTIVITY_IMAGES,
  getActivityContent,
  type ActivityKey,
} from '@/constants/activity-content';
import {
  isEarthquakeActivityAttempt,
  type EarthquakeActivityAttempt,
} from '@/constants/earthquake-attempt';
import {
  isParachuteActivityAttempt,
  type ParachuteActivityAttempt,
} from '@/constants/parachute-attempt';
import {
  isSoundPollutionActivityAttempt,
  type SoundPollutionActivityAttempt,
} from '@/constants/sound-pollution-attempt';
import { useAppTheme } from '@/hooks/use-app-theme';
import {
  getActivityRating,
  loadActivityAttempts,
  saveActivityAttempts,
  setActivityRating,
} from '@/lib/db';
import {
  clearEarthquakeRecordResultsDraft,
  loadEarthquakeRecordResultsDraft,
} from '@/lib/earthquake-record-results-draft';
import {
  clearParachuteRecordResultsDraft,
  loadParachuteRecordResultsDraft,
} from '@/lib/parachute-record-results-draft';
import {
  clearRecordResultsDraft,
  loadRecordResultsDraft,
} from '@/lib/record-results-draft';
import {
  clearSoundPollutionRecordResultsDraft,
  loadSoundPollutionRecordResultsDraft,
} from '@/lib/sound-pollution-record-results-draft';

type ActivityChallengeScreenProps = {
  activityKey: ActivityKey;
};

export function ActivityChallengeScreen({ activityKey }: ActivityChallengeScreenProps) {
  const router = useRouter();
  const content = getActivityContent(activityKey);
  const [speakingStep, setSpeakingStep] = useState<number | null>(null);
  const [rating, setRating] = useState(0);
  const [attempts, setAttempts] = useState<
    (
      | ActivityAttempt
      | ParachuteActivityAttempt
      | SoundPollutionActivityAttempt
      | EarthquakeActivityAttempt
    )[]
  >([]);
  const [draft, setDraft] = useState<{ attemptNumber: number } | null>(null);
  const { colors } = useAppTheme();
  const stepBoxBackground = colors.card;
  const stepBoxBorder = colors.borderStrong;

  const recordResultsPath = `/${activityKey}/record-results` as const;

  const themed = useMemo(
    () =>
      StyleSheet.create({
        recordButton: { backgroundColor: colors.tint },
        recordButtonText: { color: colors.onTint },
        deleteAttemptButton: { backgroundColor: colors.dangerSurface },
        deleteAttemptText: { color: colors.danger },
        attemptCard: { borderColor: colors.borderStrong, backgroundColor: colors.card },
        attemptsEmpty: { color: colors.muted },
        attemptDate: { color: colors.muted },
        ratingDisplay: { color: colors.muted },
      }),
    [colors]
  );

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const [savedRating, savedAttempts] = await Promise.all([
            getActivityRating(activityKey),
            loadActivityAttempts<
              | ActivityAttempt
              | ParachuteActivityAttempt
              | SoundPollutionActivityAttempt
              | EarthquakeActivityAttempt
            >(activityKey),
          ]);

          setRating(savedRating);
          setAttempts(savedAttempts);
        } catch (error) {
          console.error('Error loading activity data:', error);
        }
      };

      const loadDraft = async () => {
        if (activityKey === 'activity-1') {
          const savedDraft = await loadParachuteRecordResultsDraft();
          setDraft(savedDraft ? { attemptNumber: savedDraft.attemptNumber } : null);
          return;
        }
        if (activityKey === 'activity-2') {
          const savedDraft = await loadSoundPollutionRecordResultsDraft();
          setDraft(savedDraft ? { attemptNumber: savedDraft.attemptNumber } : null);
          return;
        }
        if (activityKey === 'activity-4') {
          const savedDraft = await loadEarthquakeRecordResultsDraft();
          setDraft(savedDraft ? { attemptNumber: savedDraft.attemptNumber } : null);
          return;
        }
        const savedDraft = await loadRecordResultsDraft(activityKey);
        setDraft(savedDraft ? { attemptNumber: savedDraft.attemptNumber } : null);
      };

      loadData();
      loadDraft();
    }, [activityKey])
  );

  const handleContinueDraft = () => {
    router.push(recordResultsPath);
  };

  const handleDeleteDraft = async () => {
    if (activityKey === 'activity-1') {
      await clearParachuteRecordResultsDraft();
    } else if (activityKey === 'activity-2') {
      await clearSoundPollutionRecordResultsDraft();
    } else if (activityKey === 'activity-4') {
      await clearEarthquakeRecordResultsDraft();
    } else {
      await clearRecordResultsDraft(activityKey);
    }
    setDraft(null);
  };

  const handleRating = async (stars: number) => {
    try {
      setRating(stars);
      await setActivityRating(activityKey, stars);
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  };

  const handleDeleteAttempt = (index: number) => {
    Alert.alert(
      'Delete Attempt',
      'Are you sure you want to delete this attempt?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const nextAttempts = attempts.filter((_, attemptIndex) => attemptIndex !== index);
              setAttempts(nextAttempts);
              await saveActivityAttempts(activityKey, nextAttempts);
            } catch (error) {
              console.error('Error deleting attempt:', error);
            }
          },
        },
      ]
    );
  };

  const handleSpeak = async (stepIndex: number) => {
    if (speakingStep === stepIndex) {
      await Speech.stop();
      setSpeakingStep(null);
    } else {
      if (speakingStep !== null) {
        await Speech.stop();
      }
      setSpeakingStep(stepIndex);
      await Speech.speak(content.steps[stepIndex], {
        rate: 0.9,
        pitch: 0.8,
        onDone: () => setSpeakingStep(null),
        onError: () => setSpeakingStep(null),
      });
    }
  };

  return (
    <AppScreen style={styles.screen}>
      <Pressable
        onPress={() => router.push('/(tabs)/activities')}
        style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}
        accessibilityLabel="Return to Activities">
        <IconSymbol name="chevron.left" size={26} color={colors.tint} />
      </Pressable>
      <View style={[styles.main, draft ? styles.mainWithDraft : undefined]}>
        <ParallaxScrollView
          headerBackgroundColor={{ light: colors.parallaxHeader, dark: colors.parallaxHeader }}
          headerImage={
            <Image
              source={ACTIVITY_IMAGES[activityKey]}
              style={styles.heroImage}
              contentFit="contain"
            />
          }>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">{content.title}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.stepContainer}>
            <Collapsible title="Overview">
              <ThemedView
                style={[
                  styles.stepBox,
                  { backgroundColor: stepBoxBackground, borderColor: stepBoxBorder },
                ]}>
                <ThemedText style={styles.stepText}>{content.overview}</ThemedText>
              </ThemedView>
            </Collapsible>

            <Collapsible title="Equipment">
              <ThemedView
                style={[
                  styles.stepBox,
                  { backgroundColor: stepBoxBackground, borderColor: stepBoxBorder },
                ]}>
                {content.equipment.map((item) => (
                  <ThemedText key={item} style={styles.stepText}>
                    - {item}
                  </ThemedText>
                ))}
              </ThemedView>
            </Collapsible>

            <Collapsible title="Instructions">
              <ThemedView
                style={[
                  styles.stepBox,
                  { backgroundColor: stepBoxBackground, borderColor: stepBoxBorder },
                ]}>
                {content.steps.map((text, index) => (
                  <ThemedView key={index} style={styles.stepItem}>
                    <ThemedText type="subtitle">Step {index + 1}</ThemedText>
                    <ThemedText style={styles.stepText}>{text}</ThemedText>
                    <Pressable
                      onPress={() => handleSpeak(index)}
                      style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}>
                      <ThemedText type="link">{speakingStep === index ? 'Stop' : '🔊 Listen'}</ThemedText>
                    </Pressable>
                  </ThemedView>
                ))}
              </ThemedView>
            </Collapsible>
          </ThemedView>

          <ThemedView style={styles.recordSection}>
            <Pressable
              onPress={() => router.push(recordResultsPath)}
              style={({ pressed }) => [
                styles.recordButton,
                themed.recordButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <Text style={[styles.recordButtonText, themed.recordButtonText]}>📝 Record Results</Text>
            </Pressable>
          </ThemedView>

          <ThemedView style={styles.attemptsSection}>
            <ThemedText type="defaultSemiBold">Attempts</ThemedText>
            {attempts.length === 0 ? (
              <ThemedText style={[styles.attemptsEmpty, themed.attemptsEmpty]}>
                Try the experiment to add a new attempt!
              </ThemedText>
            ) : (
              attempts.map((attempt, index) => (
                <ThemedView key={index} style={[styles.attemptCard, themed.attemptCard]}>
                  <ThemedText type="defaultSemiBold">Attempt {index + 1}</ThemedText>
                  {isParachuteActivityAttempt(attempt) ? (
                    <ParachuteAttemptSummary attempt={attempt} />
                  ) : isSoundPollutionActivityAttempt(attempt) ? (
                    <SoundPollutionAttemptSummary attempt={attempt} />
                  ) : isEarthquakeActivityAttempt(attempt) ? (
                    <EarthquakeAttemptSummary attempt={attempt} />
                  ) : (
                    <>
                      <ThemedText style={styles.attemptText}>Test 1: {attempt.test1}</ThemedText>
                      <ThemedText style={styles.attemptText}>Test 2: {attempt.test2}</ThemedText>
                      <ThemedText style={styles.attemptText}>Test 3: {attempt.test3}</ThemedText>
                      {attempt.uploadedVideo ? (
                        <ThemedText style={styles.attemptText}>Video: {attempt.uploadedVideo}</ThemedText>
                      ) : null}
                      {attempt.location ? (
                        <ThemedView style={styles.locationBoxInline}>
                          <ThemedText style={styles.locationText}>
                            Lat: {attempt.location.latitude.toFixed(6)}
                          </ThemedText>
                          <ThemedText style={styles.locationText}>
                            Lon: {attempt.location.longitude.toFixed(6)}
                          </ThemedText>
                          <ThemedText style={styles.locationText}>
                            Acc: {Math.round(attempt.location.accuracy)} m
                          </ThemedText>
                        </ThemedView>
                      ) : null}
                    </>
                  )}
                  <ThemedText style={[styles.attemptDate, themed.attemptDate]}>
                    {new Date(attempt.createdAt).toLocaleString()}
                  </ThemedText>
                  <Pressable
                    onPress={() => handleDeleteAttempt(index)}
                    style={({ pressed }) => [
                      styles.deleteAttemptButton,
                      themed.deleteAttemptButton,
                      { opacity: pressed ? 0.7 : 1 },
                    ]}>
                    <ThemedText style={[styles.deleteAttemptText, themed.deleteAttemptText]}>
                      Delete Attempt
                    </ThemedText>
                  </Pressable>
                </ThemedView>
              ))
            )}
          </ThemedView>

          <ThemedView style={styles.ratingSection}>
            <ThemedText type="defaultSemiBold">Rate Activity</ThemedText>
            <ThemedView style={styles.starContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => handleRating(star)} style={styles.starButton}>
                  <ThemedText style={styles.star}>{star <= rating ? '⭐' : '☆'}</ThemedText>
                </Pressable>
              ))}
            </ThemedView>
            {rating > 0 ? (
              <ThemedText style={[styles.ratingDisplay, themed.ratingDisplay]}>
                You rated: {rating} out of 5 stars
              </ThemedText>
            ) : null}
          </ThemedView>
        </ParallaxScrollView>
      </View>
      {draft ? (
        <RecordResultsDraftBar
          draft={draft}
          onContinue={handleContinueDraft}
          onDelete={() => {
            void handleDeleteDraft();
          }}
        />
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  backButton: {
    position: 'absolute',
    top: 4,
    left: 8,
    zIndex: 20,
    padding: 8,
  },
  main: { flex: 1 },
  mainWithDraft: { paddingBottom: 100 },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  stepBox: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    gap: 12,
  },
  stepItem: { gap: 8, marginBottom: 16 },
  stepText: { lineHeight: 24 },
  button: { paddingVertical: 8 },
  recordSection: {
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  recordButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  recordButtonText: { fontSize: 16, fontWeight: '600' },
  attemptsSection: {
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  attemptsEmpty: { fontSize: 14 },
  attemptCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  deleteAttemptButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  deleteAttemptText: { fontSize: 14, fontWeight: '600' },
  attemptText: { fontSize: 14, marginTop: 4 },
  attemptDate: { fontSize: 12, marginTop: 8 },
  locationBoxInline: { marginTop: 8 },
  locationText: { fontSize: 14, lineHeight: 20 },
  ratingSection: {
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  starContainer: { flexDirection: 'row', gap: 8 },
  starButton: { padding: 4 },
  star: { fontSize: 32 },
  ratingDisplay: { fontSize: 14, paddingHorizontal: 8 },
  heroImage: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
