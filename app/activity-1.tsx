import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { useThemeColor } from '@/hooks/use-theme-color';

const steps = [
  'Drop the toy without a parachute and record the fall. This is a baseline test.',
  'Build a parachute using provided materials.',
  'Drop the toy from the same height and record the fall.',
  'Review speed and landing accuracy results in the app.',
  'Redesign and test up to three prototypes within 20 minutes.',
  'Upload videos, results, and team reflections.',
];

export default function ParachuteScreen() {
  const router = useRouter();
  const [speakingStep, setSpeakingStep] = useState<number | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [attempts, setAttempts] = useState<Array<{
    test1: string;
    test2: string;
    test3: string;
    createdAt: string;
    uploadedVideo?: string | null;
    location?: { latitude: number; longitude: number; accuracy: number } | null;
  }>>([]);
  const stepBoxBackground = useThemeColor({ light: '#FFFFFF', dark: '#1F2428' }, 'background');
  const stepBoxBorder = useThemeColor({ light: '#D0D5DD', dark: '#2F353A' }, 'text');

  useFocusEffect(
    useCallback(() => {
      const loadRating = async () => {
        try {
          const savedRating = await AsyncStorage.getItem('activity-1-rating');
          if (savedRating) {
            setRating(parseInt(savedRating, 10));
          }
        } catch (error) {
          console.error('Error loading rating:', error);
        }
      };
      const loadData = async () => {
        try {
          const [savedRating, savedAttempts] = await Promise.all([
            AsyncStorage.getItem('activity-1-rating'),
            AsyncStorage.getItem('activity-1-attempts'),
          ]);

          if (savedRating) {
            setRating(parseInt(savedRating, 10));
          }

          if (savedAttempts) {
            const parsed = JSON.parse(savedAttempts) as Array<{
              test1: string;
              test2: string;
              test3: string;
              createdAt: string;
              uploadedVideo?: string | null;
              location?: { latitude: number; longitude: number; accuracy: number } | null;
            }>;
            setAttempts(parsed);
          }
        } catch (error) {
          console.error('Error loading activity data:', error);
        }
      };

      loadData();
    }, [])
  );

  const handleRating = async (stars: number) => {
    try {
      setRating(stars);
      await AsyncStorage.setItem('activity-1-rating', stars.toString());
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
              await AsyncStorage.setItem('activity-1-attempts', JSON.stringify(nextAttempts));
            } catch (error) {
              console.error('Error deleting attempt:', error);
            }
          },
        },
      ]
    );
  };

  // Upload and location handlers moved to Record Results screen

  const handleSpeak = async (stepIndex: number) => {
    if (speakingStep === stepIndex) {
      await Speech.stop();
      setSpeakingStep(null);
    } else {
      if (speakingStep !== null) {
        await Speech.stop();
      }
      setSpeakingStep(stepIndex);
      await Speech.speak(steps[stepIndex], {
        rate: 0.9,
        pitch: 0.8,
        onDone: () => setSpeakingStep(null),
        onError: () => setSpeakingStep(null),
      });
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Parachute Drop Challenge</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <Collapsible title="Overview">
          <ThemedView
            style={[
              styles.stepBox,
              { backgroundColor: stepBoxBackground, borderColor: stepBoxBorder },
            ]}>
            <ThemedText style={styles.stepText}>
              Students design, build, and test a parachute for a small toy to reduce its landing speed and impact force. Teams iterate their designs under time and material constraints, aiming to achieve the slowest and safest landing within a target area.
            </ThemedText>
          </ThemedView>
        </Collapsible>

        <Collapsible title="Equipment">
          <ThemedView
            style={[
              styles.stepBox,
              { backgroundColor: stepBoxBackground, borderColor: stepBoxBorder },
            ]}>
            <ThemedText style={styles.stepText}>- Mobile phone with STEMM Lab app</ThemedText>
            <ThemedText style={styles.stepText}>- Small toy (e.g. army toy soldier)</ThemedText>
            <ThemedText style={styles.stepText}>- Table or elevated surface</ThemedText>
            <ThemedText style={styles.stepText}>- Paper or plastic</ThemedText>
            <ThemedText style={styles.stepText}>- String</ThemedText>
            <ThemedText style={styles.stepText}>- Scissors</ThemedText>
            <ThemedText style={styles.stepText}>- Tape</ThemedText>
          </ThemedView>
        </Collapsible>

        <Collapsible title="Instructions">
          <ThemedView
            style={[
              styles.stepBox,
              { backgroundColor: stepBoxBackground, borderColor: stepBoxBorder },
            ]}>
            {steps.map((text, i) => (
              <ThemedView key={i} style={styles.stepItem}>
                <ThemedText type="subtitle">Step {i + 1}</ThemedText>
                <ThemedText style={styles.stepText}>{text}</ThemedText>
                <Pressable
                  onPress={() => handleSpeak(i)}
                  style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}> 
                  <ThemedText type="link">{speakingStep === i ? 'Stop' : '🔊 Listen'}</ThemedText>
                </Pressable>
              </ThemedView>
            ))}
          </ThemedView>
        </Collapsible>
      </ThemedView>

      {/* Upload and location moved to Record Results page; data shown per-attempt below */}

      <ThemedView style={styles.recordSection}>
        <Pressable
          onPress={() => router.push('/activity-1/record-results')}
          style={({ pressed }) => [styles.recordButton, { opacity: pressed ? 0.7 : 1 }]}> 
          <ThemedText style={styles.recordButtonText}>📝 Record Results</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView style={styles.attemptsSection}>
        <ThemedText type="defaultSemiBold">Attempts</ThemedText>
        {attempts.length === 0 ? (
          <ThemedText style={styles.attemptsEmpty}>Try the experiment to add a new attempt!</ThemedText>
        ) : (
          attempts.map((attempt, index) => (
            <ThemedView key={index} style={styles.attemptCard}>
              <ThemedText type="defaultSemiBold">Attempt {index + 1}</ThemedText>
              <ThemedText style={styles.attemptText}>Test 1: {attempt.test1}</ThemedText>
              <ThemedText style={styles.attemptText}>Test 2: {attempt.test2}</ThemedText>
              <ThemedText style={styles.attemptText}>Test 3: {attempt.test3}</ThemedText>
              {attempt.uploadedVideo ? (
                <ThemedText style={styles.attemptText}>Video: {attempt.uploadedVideo}</ThemedText>
              ) : null}
              {attempt.location ? (
                <ThemedView style={styles.locationBoxInline}>
                  <ThemedText style={styles.locationText}>Lat: {attempt.location.latitude.toFixed(6)}</ThemedText>
                  <ThemedText style={styles.locationText}>Lon: {attempt.location.longitude.toFixed(6)}</ThemedText>
                  <ThemedText style={styles.locationText}>Acc: {Math.round(attempt.location.accuracy)} m</ThemedText>
                </ThemedView>
              ) : null}
              <ThemedText style={styles.attemptDate}>{new Date(attempt.createdAt).toLocaleString()}</ThemedText>
              <Pressable
                onPress={() => handleDeleteAttempt(index)}
                style={({ pressed }) => [styles.deleteAttemptButton, { opacity: pressed ? 0.7 : 1 }]}
              >
                <ThemedText style={styles.deleteAttemptText}>Delete Attempt</ThemedText>
              </Pressable>
            </ThemedView>
          ))
        )}
      </ThemedView>

      <ThemedView style={styles.ratingSection}>
        <ThemedText type="defaultSemiBold">Rate Activity</ThemedText>
        <ThemedView style={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => handleRating(star)}
              style={styles.starButton}>
              <ThemedText style={styles.star}>{star <= rating ? '⭐' : '☆'}</ThemedText>
            </Pressable>
          ))}
        </ThemedView>
        {rating > 0 && (
          <ThemedText style={styles.ratingDisplay}>You rated: {rating} out of 5 stars</ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
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
  stepItem: {
    gap: 8,
    marginBottom: 16,
  },
  stepText: {
    lineHeight: 24,
  },
  button: {
    paddingVertical: 8,
  },
  uploadSection: {
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  uploadButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadedFileName: {
    fontSize: 14,
    color: '#4CAF50',
    paddingHorizontal: 16,
  },
  locationSection: {
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  locationButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationBox: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  locationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  locationError: {
    fontSize: 14,
    color: '#FF6B6B',
    paddingHorizontal: 16,
  },
  recordSection: {
    gap: 8,
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  recordButton: {
    backgroundColor: '#F2994A',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  attemptsSection: {
    gap: 12,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  attemptsEmpty: {
    fontSize: 14,
    color: '#6B7280',
  },
  attemptCard: {
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#fff',
  },
  deleteAttemptButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F8D7DA',
  },
  deleteAttemptText: {
    fontSize: 14,
    color: '#B91C1C',
    fontWeight: '600',
  },
  attemptText: {
    fontSize: 14,
    marginTop: 4,
  },
  attemptDate: {
    fontSize: 12,
    marginTop: 8,
    color: '#6B7280',
  },
  locationBoxInline: {
    marginTop: 8,
  },
  ratingSection: {
    gap: 12,
    marginTop: 16,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  star: {
    fontSize: 32,
  },
  ratingDisplay: {
    fontSize: 14,
    paddingHorizontal: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
