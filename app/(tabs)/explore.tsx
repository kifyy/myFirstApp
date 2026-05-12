import { Image } from 'expo-image';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';

import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function TabTwoScreen() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const instructionsText = 
    '1. Drop the toy without a parachute and record the fall, baseline test. ' +
    '2. Build a parachute using provided materials. ' +
    '3. Drop the toy from the same height and record the fall. ' +
    '4. Review speed and landing accuracy results in the app. ' +
    '5. Redesign and test up to three prototypes within 20 minutes. ' +
    '6. Upload videos, results, and team reflections.';

  const handleSpeak = async () => {
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await Speech.speak(instructionsText, {
        rate: 0.8,
        pitch: 0.8,
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Parachute Drop Challenge
        </ThemedText>
      </ThemedView>
      <ThemedText>Overview</ThemedText>
      <Collapsible title="Instructions">
        <ThemedText>1. Drop the toy without a parachute and record the fall (baseline test).</ThemedText>
        <ThemedText>2. Build a parachute using provided materials.</ThemedText>
        <ThemedText>3. Drop the toy from the same height and record the fall.</ThemedText>
        <ThemedText>4. Review speed and landing accuracy results in the app.</ThemedText>
        <ThemedText>5. Redesign and test up to three prototypes within 20 minutes.</ThemedText>
        <ThemedText>6. Upload videos, results, and team reflections.</ThemedText>
        <Pressable
          onPress={handleSpeak}
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.6 : 1 },
          ]}>
          <ThemedText type="link">{isSpeaking ? 'Stop Reading' : 'Read Instructions Aloud'}</ThemedText>
        </Pressable>
      </Collapsible>

      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    marginTop: 12,
    padding: 10,
  },
});
