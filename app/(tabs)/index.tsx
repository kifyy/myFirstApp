import { Image } from 'expo-image';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const steps = [
  'Drop the toy without a parachute and record the fall. This is a baseline test.',
  'Build a parachute using provided materials.',
  'Drop the toy from the same height and record the fall.',
  'Review speed and landing accuracy results in the app.',
  'Redesign and test up to three prototypes within 20 minutes.',
  'Upload videos, results, and team reflections.',
];

export default function HomeScreen() {
  const [speakingStep, setSpeakingStep] = useState<number | null>(null);

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
        <ThemedText type="subtitle">Step 1</ThemedText>
        <ThemedView style={styles.stepTextRow}>
          <ThemedText style={{ flex: 1 }}>Drop the toy without a parachute and record the fall. This is a baseline test.</ThemedText>
          <Pressable
            onPress={() => handleSpeak(0)}
            style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText type="link">{speakingStep === 0 ? 'Stop' : '🔊 Listen'}</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2</ThemedText>
        <ThemedView style={styles.stepTextRow}>
          <ThemedText style={{ flex: 1 }}>Build a parachute using provided materials.</ThemedText>
          <Pressable
            onPress={() => handleSpeak(1)}
            style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText type="link">{speakingStep === 1 ? 'Stop' : '🔊 Listen'}</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3</ThemedText>
        <ThemedView style={styles.stepTextRow}>
          <ThemedText style={{ flex: 1 }}>Drop the toy from the same height and record the fall.</ThemedText>
          <Pressable
            onPress={() => handleSpeak(2)}
            style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText type="link">{speakingStep === 2 ? 'Stop' : '🔊 Listen'}</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 4</ThemedText>
        <ThemedView style={styles.stepTextRow}>
          <ThemedText style={{ flex: 1 }}>Review speed and landing accuracy results in the app.</ThemedText>
          <Pressable
            onPress={() => handleSpeak(3)}
            style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText type="link">{speakingStep === 3 ? 'Stop' : '🔊 Listen'}</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 5</ThemedText>
        <ThemedView style={styles.stepTextRow}>
          <ThemedText style={{ flex: 1 }}>Redesign and test up to three prototypes within 20 minutes.</ThemedText>
          <Pressable
            onPress={() => handleSpeak(4)}
            style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText type="link">{speakingStep === 4 ? 'Stop' : '🔊 Listen'}</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 6</ThemedText>
        <ThemedView style={styles.stepTextRow}>
          <ThemedText style={{ flex: 1 }}>Upload videos, results, and team reflections.</ThemedText>
          <Pressable
            onPress={() => handleSpeak(5)}
            style={({ pressed }) => [styles.button, { opacity: pressed ? 0.6 : 1 }]}>
            <ThemedText type="link">{speakingStep === 5 ? 'Stop' : '🔊 Listen'}</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  stepTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    paddingVertical: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
