import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';
import * as Location from 'expo-location';
import { useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

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
  const [speakingStep, setSpeakingStep] = useState<number | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; accuracy: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
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
      loadRating();
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

  const handleTagLocation = async () => {
    try {
      setLocationError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
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

  const handleUploadVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadedVideo(result.assets[0].name || 'Video selected');
      }
    } catch (error) {
      console.error('Error picking video:', error);
    }
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

      <ThemedView style={styles.uploadSection}>
        <Pressable
          onPress={handleUploadVideo}
          style={({ pressed }) => [styles.uploadButton, { opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText style={styles.uploadButtonText}>📹 Upload Video</ThemedText>
        </Pressable>
        {uploadedVideo && (
          <ThemedText style={styles.uploadedFileName}>✓ {uploadedVideo}</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.locationSection}>
        <Pressable
          onPress={handleTagLocation}
          style={({ pressed }) => [styles.locationButton, { opacity: pressed ? 0.7 : 1 }]}>
          <ThemedText style={styles.locationButtonText}>📍 Tag Location</ThemedText>
        </Pressable>
        {location && (
          <ThemedView
            style={[
              styles.locationBox,
              { backgroundColor: stepBoxBackground, borderColor: stepBoxBorder },
            ]}>
            <ThemedText type="subtitle">Location Tagged</ThemedText>
            <ThemedText style={styles.locationText}>
              Latitude: {location.latitude.toFixed(6)}
            </ThemedText>
            <ThemedText style={styles.locationText}>
              Longitude: {location.longitude.toFixed(6)}
            </ThemedText>
            <ThemedText style={styles.locationText}>
              Accuracy: {Math.round(location.accuracy)} m
            </ThemedText>
          </ThemedView>
        )}
        {locationError && (
          <ThemedText style={styles.locationError}>{locationError}</ThemedText>
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
